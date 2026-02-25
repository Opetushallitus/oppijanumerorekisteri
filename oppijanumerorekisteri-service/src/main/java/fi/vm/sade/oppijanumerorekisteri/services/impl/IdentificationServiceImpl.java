package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import fi.vm.sade.oppijanumerorekisteri.utils.YhteystietoryhmaUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.KoodiValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class IdentificationServiceImpl implements IdentificationService {

    private final HenkiloRepository henkiloRepository;

    private final OrikaConfiguration mapper;

    private final KoodistoService koodistoService;
    private final YksilointiService yksilointiService;
    private final HenkiloModificationService henkiloModificationService;
    private final DuplicateService duplicateService;
    private final OppijaTuontiService oppijaTuontiService;
    private final OppijanumerorekisteriProperties properties;
    private final IdentificationRepository identificationRepository;

    private Henkilo getHenkiloByOid(String oid) {
        return henkiloRepository.findByOidHenkilo(oid).orElseThrow(()
                -> new NotFoundException("Henkilöä ei löytynyt OID:lla " + oid));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IdentificationDto> listByHenkiloOid(String oid) {
        Henkilo henkilo = getHenkiloByOid(oid);
        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    @Override
    @Transactional
    public List<IdentificationDto> create(String oid, IdentificationDto dto) {
        boolean isValidIdp = KoodiValidator.isValid(koodistoService, Koodisto.HENKILON_TUNNISTETYYPIT, dto.getIdpEntityId().getIdpEntityId());
        if (!isValidIdp) {
            throw new ValidationException("Tuntematon koodiston 'henkilontunnistetyypit' koodi " + dto.getIdpEntityId().getIdpEntityId());
        }

        if (IdpEntityId.eidas.equals(dto.getIdpEntityId())) {
            throw new ValidationException("eIDAS-tunnisteiden lisääminen ei ole sallittua");
        }

        var duplicates = identificationRepository.findIdentical(dto);
        if (!duplicates.isEmpty()) {
            throw new ValidationException("Duplikaattitunnisteiden lisääminen ei ole sallittua");
        }

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
    public List<IdentificationDto> remove(String oid, IdpEntityId idpEntityId, String identifier) {
        Henkilo henkilo = getHenkiloByOid(oid);
        henkilo.getIdentifications().removeIf(i ->
                idpEntityId.equals(i.getIdpEntityId()) && identifier.equals(i.getIdentifier()));
        this.henkiloModificationService.update(henkilo);
        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.NEVER) // metodissa tehtyä selectejä ei ole tarpeen roikuttaa transaktiossa
    public void identifyHenkilos(List<String> unidentifiedOids, Long vtjRequestDelayInMillis) {
        unidentifiedOids.stream()
                .forEach(oid -> {
                    waitBetweenRequests(vtjRequestDelayInMillis);
                    log.info("Henkilo {} passed initial validation, trying to identify...", oid);
                    identifyHenkilo(oid);
                });
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
            yksilointiService.yksiloiAutomaattisesti(oid);
            log.info("Henkilo {} successfully identified.", oid);
        } catch (Exception e) {
            log.error("Henkilo {} unsuccessfully identified.", oid, e);
            yksilointiService.tallennaYksilointivirhe(oid, e);
        }
    }

    public void yksilointiTask() {
        OppijanumerorekisteriProperties.Scheduling.Yksilointi yksilointiProperties = properties
                .getScheduling().getYksilointi();
        Long offset = 0L;
        List<String> unidentifiedOids = henkiloRepository
                .findUnidentified(yksilointiProperties.getBatchSize(), offset);
        while (!unidentifiedOids.isEmpty()) {
            identifyHenkilos(unidentifiedOids, yksilointiProperties.getVtjRequestDelayInMillis());
            offset += yksilointiProperties.getBatchSize();
            unidentifiedOids = henkiloRepository.findUnidentified(yksilointiProperties.getBatchSize(), offset);
        }

        // Onko oppijoiden tuonteja valmistunut ja onko tarvetta lähettää
        // sähköposti-ilmoitus
        oppijaTuontiService.handleOppijaTuontiIlmoitus();
    }
}
