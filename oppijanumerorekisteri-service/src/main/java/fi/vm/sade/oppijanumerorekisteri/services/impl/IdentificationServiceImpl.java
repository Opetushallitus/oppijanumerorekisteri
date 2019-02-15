package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointivirheRepository;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import fi.vm.sade.oppijanumerorekisteri.utils.YhteystietoryhmaUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.Date;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class IdentificationServiceImpl implements IdentificationService {

    private final HenkiloRepository henkiloRepository;
    private final YksilointitietoRepository yksilointitietoRepository;
    private final YksilointivirheRepository yksilointivirheRepository;

    private final OrikaConfiguration mapper;

    private final YksilointiService yksilointiService;
    private final HenkiloModificationService henkiloModificationService;
    private final DuplicateService duplicateService;

    private Henkilo getHenkiloByOid(String oid) {
        return henkiloRepository.findByOidHenkilo(oid).orElseThrow(()
                -> new NotFoundException("Henkilöä ei löytynyt OID:lla " + oid));
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<IdentificationDto> listByHenkiloOid(String oid) {
        Henkilo henkilo = getHenkiloByOid(oid);
        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    @Override
    @Transactional
    public Iterable<IdentificationDto> create(String oid, IdentificationDto dto) {
        Henkilo henkilo = henkiloRepository.findByIdentification(oid, dto)
                .orElseGet(() -> save(oid, dto));

        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    private Henkilo save(String oid, IdentificationDto dto) {
        Henkilo henkilo = getHenkiloByOid(oid);
        Identification identification = mapper.map(dto, Identification.class);
        henkilo.getIdentifications().add(identification);
        return henkiloModificationService.update(henkilo);
    }

    @Override
    @Transactional
    public Iterable<IdentificationDto> remove(String oid, IdentificationDto identificationDto) {
        Henkilo henkilo = getHenkiloByOid(oid);
        Identification identification = mapper.map(identificationDto, Identification.class);
        henkilo.getIdentifications().removeIf(i ->
                identification.getIdpEntityId().equals(i.getIdpEntityId()) &&
                        identification.getIdentifier().equals(i.getIdentifier()));
        this.henkiloModificationService.update(henkilo);
        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.NEVER) // metodissa tehtyä selectejä ei ole tarpeen roikuttaa transaktiossa
    public void identifyHenkilos(Collection<Henkilo> unidentified, Long vtjRequestDelayInMillis) {
        unidentified.stream()
                .peek(this::logFaults)
                .filter(this::hasRetriableYksilointivirhe)
                .filter(this::hasNoDataInconsistency)
                .forEach(henkilo -> {
                    this.waitBetweenRequests(vtjRequestDelayInMillis);
                    log.debug("Henkilo {} passed initial validation, {} to identify...", henkilo.getOidHenkilo(), henkilo.isYksilointiYritetty() ? "retrying" : "trying");
                    this.identifyHenkilo(henkilo.getOidHenkilo());
                });
    }

    private boolean hasRetriableYksilointivirhe(Henkilo henkilo) {
        Optional<Yksilointivirhe> yksilointivirhe = yksilointivirheRepository.findByHenkilo(henkilo);
        boolean yksilointiAikaleimaVoimasssa = yksilointivirhe.isPresent()
                && yksilointivirhe.get().getUudelleenyritysAikaleima() != null
                && new Date().after(yksilointivirhe.get().getUudelleenyritysAikaleima());
        return !yksilointivirhe.isPresent() || yksilointiAikaleimaVoimasssa;
    }

    /**
     * If an unidentified person already has reference data there must be an inconsistency in the data.
     * Those cases must be solved by officials.
     */
    private boolean hasNoDataInconsistency(Henkilo henkilo) {
        return !(!henkilo.isYksiloityVTJ() && StringUtils.hasLength(henkilo.getHetu()) && yksilointitietoRepository.findByHenkilo(henkilo).isPresent());
    }

    @Override
    @Transactional
    public void setStrongIdentifiedHetu(String oidHenkilo, HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto) {
        Henkilo henkiloToUpdate = this.henkiloRepository.findByOidHenkilo(oidHenkilo)
                .orElseThrow(() -> new NotFoundException("Henkilo not found with oid " + oidHenkilo));

        DuplicateService.LinkResult linked = this.duplicateService.removeDuplicateHetuAndLink(henkiloToUpdate, henkiloVahvaTunnistusDto.getHetu());

        // No current hetu and hetu not already used => set hetu
        this.setHetuIfMatchesToHenkilo(henkiloVahvaTunnistusDto, henkiloToUpdate);

        if (StringUtils.hasLength(henkiloVahvaTunnistusDto.getTyosahkopostiosoite())) {
            String alkupera = "alkupera2";
            YhteystietoryhmaUtils.setTyosahkopostiosoite(henkiloToUpdate.getYhteystiedotRyhma(), henkiloVahvaTunnistusDto.getTyosahkopostiosoite(), alkupera);
        }

        linked.forEachModified(henkiloModificationService::update);
    }

    private void setHetuIfMatchesToHenkilo(HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto, Henkilo henkilo) {
        // Do not allow replacing differing not empty hetu
        Optional.ofNullable(henkilo.getHetu())
                .filter(StringUtils::hasLength)
                .filter((hetu) -> !hetu.equals(henkiloVahvaTunnistusDto.getHetu()))
                .ifPresent((existingDifferentHetu) -> {
                    throw new DataInconsistencyException("Hetu does not match with the existing one");
                });
        henkilo.setHetu(henkiloVahvaTunnistusDto.getHetu());
    }

    private void logFaults(Henkilo henkilo) {
        if (!log.isDebugEnabled()) {
            return;
        }
        if (!hasRetriableYksilointivirhe(henkilo)) {
            log.debug("Henkilo {} has been black listed from processing.", henkilo.getOidHenkilo());
        }
        if (!hasNoDataInconsistency(henkilo)) {
            log.debug("Henkilo {} has inconsistent data that must be solved by officials.", henkilo.getOidHenkilo());
        }
    }

    /**
     * VTJ service can't handle high loads so we must wait between requests.
     */
    private void waitBetweenRequests(long waitTimeMillis) {
        try {
            Thread.sleep(waitTimeMillis);
        } catch (InterruptedException ie) {
            log.error("Sleep interrupted.");
        }
    }

    private void identifyHenkilo(String oid) {
        try {
            this.yksilointiService.yksiloiAutomaattisesti(oid);
            log.debug("Henkilo {} successfully identified.", oid);
        } catch (Exception e) {
            yksilointiService.tallennaYksilointivirhe(oid, e);
        }
    }

}
