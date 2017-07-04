package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;

import java.util.Collection;
import java.util.Date;
import java.util.Optional;

import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class IdentificationServiceImpl implements IdentificationService {

    private final HenkiloRepository henkiloRepository;
    private final HenkiloJpaRepository henkiloJpaRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final OrikaConfiguration mapper;
    private final YksilointiService yksilointiService;

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
        Optional<Henkilo> h = this.yksilointiService.yksiloiAutomaattisesti(henkilo.getOidHenkilo());
        if (!henkilo.isYksiloityVTJ()) {
            log.warn("Henkilo {} not identified, data mismatch.", henkilo.getOidHenkilo());
        }
        log.debug("Henkilo {} successfully identified.", henkilo.getOidHenkilo());
        if(!h.isPresent()) {
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
//        } catch (HttpConnectionException e) {
//            log.error("VTJ service could not be reached!");
//        }
    }

}
