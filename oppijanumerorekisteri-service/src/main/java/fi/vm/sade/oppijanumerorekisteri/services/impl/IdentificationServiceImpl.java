package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
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
import java.util.stream.Collectors;

import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
public class IdentificationServiceImpl implements IdentificationService {

    private final HenkiloRepository henkiloRepository;
    private final HenkiloJpaRepository henkiloJpaRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final OrikaConfiguration mapper;
    private final YksilointiService yksilointiService;

    public IdentificationServiceImpl(HenkiloRepository henkiloRepository,
            HenkiloJpaRepository henkiloJpaRepository,
            UserDetailsHelper userDetailsHelper,
            OrikaConfiguration mapper, YksilointiService yksilointiService) {
        this.henkiloRepository = henkiloRepository;
        this.henkiloJpaRepository = henkiloJpaRepository;
        this.userDetailsHelper = userDetailsHelper;
        this.mapper = mapper;
        this.yksilointiService = yksilointiService;
    }

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

    public Collection<Henkilo> identifyHenkilos(Collection<Henkilo> unidentified, Long vtjRequestDelayInMillis) {
        return unidentified.stream()
            .filter(this::isProcessable)
            .map(henkilo -> {
                waitBetweenRequests(vtjRequestDelayInMillis);
                log.debug("Henkilo {} passed initial validation, {} to identify...", henkilo.getOidHenkilo(), henkilo.isYksilointiYritetty() ? "retrying" : "trying");
                return identifyHenkilo(henkilo);
            }).collect(Collectors.toList());
    }

    private boolean isProcessable(Henkilo henkilo) {
        if (henkilo.isBlackListed()) {
            log.debug("Henkilo {} has been black listed from processing.", henkilo.getOidHenkilo());
            return false;
        }

        if (henkilo.hasDataInconsistency()) {
            log.warn("Henkilo {} has inconsistent data that must be solved by officials.", henkilo.getOidHenkilo());
            return false;
        }

        /*
         * Fake SSNs (900-series) are skipped since they have no counterpart in VTJ database, e.g. 123456-912X.
         * NOTE: If test environment VTJ is fixed change this restriction to only apply for production environment since
         * test environment uses the 900-series SSNs.
         */
        if (henkilo.hasFakeSSN()) {
            log.info("Henkilo {} is using a fake SSN and cannot be identified.", henkilo.getOidHenkilo());
            return false;
        }
        return true;
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

    private Henkilo identifyHenkilo(Henkilo henkilo) {
        try {
            henkilo = yksilointiService.yksiloiManuaalisesti(henkilo);
            if (!henkilo.isYksiloityVTJ()) {
                log.warn("Henkilo {} not identified, data mismatch.", henkilo.getOidHenkilo());
            }
            log.debug("Henkilo {} successfully identified.", henkilo.getOidHenkilo());
            return henkiloRepository.save(henkilo);
        } catch (NotFoundException e) {
            log.error("Henkilo {} not found in VTJ.", henkilo.getOidHenkilo());
            if (henkilo.isYksilointiYritetty()) {
                henkilo.setEiYksiloida(true);
            } else {
                henkilo.setYksilointiYritetty(true);
            }
            return henkiloRepository.save(henkilo);
        } catch (HttpConnectionException e) {
            log.error("VTJ service could not be reached!");
            return henkilo;
        }
    }

}
