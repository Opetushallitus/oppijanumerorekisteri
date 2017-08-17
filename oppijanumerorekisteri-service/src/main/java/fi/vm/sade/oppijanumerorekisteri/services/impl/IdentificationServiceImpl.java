package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DuplicateHetuException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class IdentificationServiceImpl implements IdentificationService {

    private final HenkiloRepository henkiloRepository;
    private final HenkiloJpaRepository henkiloJpaRepository;

    private final UserDetailsHelper userDetailsHelper;

    private final OrikaConfiguration mapper;

    private final YksilointiService yksilointiService;
    private final HenkiloService henkiloService;

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
    @Transactional(readOnly = false)
    public Iterable<IdentificationDto> create(String oid, IdentificationDto dto) {
        Henkilo henkilo = henkiloJpaRepository.findByIdentification(dto)
                .orElseGet(() -> save(oid, dto));

        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    private Henkilo save(String oid, IdentificationDto dto) {
        Henkilo henkilo = getHenkiloByOid(oid);
        Identification identification = mapper.map(dto, Identification.class);
        henkilo.getIdentifications().add(identification);
        henkilo.setModified(new Date());
        henkilo.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());
        return henkiloRepository.save(henkilo);
    }

    @Override
    @Transactional
    public void identifyHenkilos(Collection<Henkilo> unidentified, Long vtjRequestDelayInMillis) {
        unidentified.stream()
                .peek(this::logFaults)
                .filter(Henkilo::isNotBlackListed)
                .filter(Henkilo::hasNoDataInconsistency)
                .filter(Henkilo::hasNoFakeHetu)
                .forEach(henkilo -> {
                    this.waitBetweenRequests(vtjRequestDelayInMillis);
                    log.debug("Henkilo {} passed initial validation, {} to identify...", henkilo.getOidHenkilo(), henkilo.isYksilointiYritetty() ? "retrying" : "trying");
                    this.identifyHenkilo(henkilo);
                });
    }

    @Override
    @Transactional
    public void setStrongIdentifiedHetu(String oidHenkilo, HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto) {
        Henkilo henkiloToUpdate = this.henkiloRepository.findByOidHenkilo(oidHenkilo)
                .orElseThrow(() -> new NotFoundException("Henkilo not found with oid " + oidHenkilo));
        List<Henkilo> henkilosWithSameHetu = this.henkiloRepository.findByHetu(henkiloVahvaTunnistusDto.getHetu());

        // If another virkailija with same hetu exists => error
        henkilosWithSameHetu.stream()
                .filter((henkiloWithSameHetu) -> henkiloWithSameHetu.getHenkiloTyyppi() == HenkiloTyyppi.VIRKAILIJA)
                .filter((henkiloWithSameHetu) -> !henkiloWithSameHetu.getOidHenkilo().equals(oidHenkilo))
                .findAny()
                .ifPresent((virkailijaWithSameHetu) -> {throw new DuplicateHetuException("Hetu already exists for other virkailija");});

        // Oppija with same hetu => combine
        henkilosWithSameHetu.stream()
                .filter((henkiloWithSameHetu) -> henkiloWithSameHetu.getHenkiloTyyppi() == HenkiloTyyppi.OPPIJA)
                .findAny()
                .ifPresent((oppijaWithSameHetu) -> {
                    oppijaWithSameHetu.setHetu(null);
                    // Hetu is unique so we need to flush when moving it
                    this.henkiloRepository.saveAndFlush(oppijaWithSameHetu);
                    this.henkiloService.linkHenkilos(oidHenkilo, Lists.newArrayList(oppijaWithSameHetu.getOidHenkilo()));
                });

        // No current hetu and hetu not already used => set hetu
        this.setHetuIfMatchesToHenkilo(henkiloVahvaTunnistusDto, henkiloToUpdate);
    }


    private void setHetuIfMatchesToHenkilo(HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto, Henkilo henkilo) {
        Optional.ofNullable(henkilo.getHetu())
                .filter(StringUtils::hasLength)
                .filter((hetu) -> !hetu.equals(henkiloVahvaTunnistusDto.getHetu()))
                .ifPresent((existingDifferentHetu) -> {
                    throw new DataInconsistencyException("Hetu does not match with the existing one");
                });
        Optional<String> validHetu = Optional.ofNullable(henkiloVahvaTunnistusDto.getHetu())
                .filter((hetu) -> henkilo.getEtunimet().equals(henkiloVahvaTunnistusDto.getEtunimet()))
                .filter((hetu) -> henkilo.getSukunimi().equals(henkiloVahvaTunnistusDto.getSukunimi()));
        henkilo.setHetu(validHetu
                .orElseThrow(() -> new DataInconsistencyException("Etunimet or sukunimi does not match with existing ones")));
    }

    private void logFaults(Henkilo henkilo) {
        if (!henkilo.isNotBlackListed()) {
            log.debug("Henkilo {} has been black listed from processing.", henkilo.getOidHenkilo());
        }
        if (!henkilo.hasNoDataInconsistency()) {
            log.warn("Henkilo {} has inconsistent data that must be solved by officials.", henkilo.getOidHenkilo());
        }
        /*
         * Fake SSNs (900-series) are skipped since they have no counterpart in VTJ database, e.g. 123456-912X.
         * NOTE: If test environment VTJ is fixed change this restriction to only apply for production environment since
         * test environment uses the 900-series SSNs.
         */
        if (!henkilo.hasNoFakeHetu()) {
            log.info("Henkilo {} is using a fake SSN and cannot be identified.", henkilo.getOidHenkilo());
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

    private void identifyHenkilo(Henkilo henkilo) {
        Optional<Henkilo> yksiloityHenkilo = this.yksilointiService.yksiloiAutomaattisesti(henkilo.getOidHenkilo());
        log.debug("Henkilo {} successfully identified.", henkilo.getOidHenkilo());
        if(!yksiloityHenkilo.isPresent()) {
            // No guarantee that henkilo parameter is persisted
            Henkilo changableHenkilo = this.henkiloRepository.findByOidHenkilo(henkilo.getOidHenkilo())
                    .orElseThrow(NotFoundException::new);
            if (changableHenkilo.isYksilointiYritetty()) {
                changableHenkilo.setEiYksiloida(true);
            }
            else {
                changableHenkilo.setYksilointiYritetty(true);
            }
        }
    }

}
