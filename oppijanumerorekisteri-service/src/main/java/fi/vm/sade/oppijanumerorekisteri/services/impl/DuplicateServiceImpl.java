package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.aspects.AuditlogAspectHelper;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplikaattiCriteria;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.common.collect.Lists;

import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Slf4j
@Service
@RequiredArgsConstructor
public class DuplicateServiceImpl implements DuplicateService {
    private final HenkiloRepository henkiloDataRepository;
    private final HenkiloViiteRepository henkiloViiteRepository;
    private final HakuappClient hakuappClient;
    private final AtaruClient ataruClient;
    private final UserDetailsHelper userDetailsHelper;
    private final OrikaConfiguration mapper;
    private final KayttooikeusClient kayttooikeusClient;
    private final AuditlogAspectHelper auditlogAspectHelper;

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDuplicateDto> findDuplicates(String oid) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("User with oid " + oid + " was not found"));
        HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(henkilo.getEtunimet(),
                henkilo.getKutsumanimi(), henkilo.getSukunimi(), henkilo.getSyntymaaika());
        List<String> linked = henkiloViiteRepository.findBySlaveOid(oid).stream().map(HenkiloViite::getMasterOid)
                .collect(toList());
        List<Henkilo> candidates = this.henkiloDataRepository.findDuplikaatit(criteria).stream()
                .filter(duplicate -> filterDuplicate(henkilo, duplicate))
                .filter(duplicate -> !linked.contains(duplicate.getOidHenkilo()))
                .collect(toList());
        return getHenkiloDuplicateDtoList(candidates);
    }

    public boolean filterDuplicate(Henkilo henkilo, Henkilo duplicate) {
        boolean notSameOid = !duplicate.getOidHenkilo().equals(henkilo.getOidHenkilo());
        boolean ytjIdentifiedfilter = !henkilo.isYksiloityVTJ() || henkilo.getHetu() == null
                || !duplicate.isYksiloityVTJ();
        return notSameOid && ytjIdentifiedfilter;
    }

    @Override
    public List<HakemusDto> getApplications(String oid) {
        List<String> oids = henkiloViiteRepository.getLinked(Set.of(oid))
                .stream()
                .map(HenkiloViiteRepository.Linked::getLinked)
                .collect(Collectors.toList());
        oids.add(oid);
        return getApplications(oids)
                .values()
                .stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDuplicateDto> getDuplikaatit(HenkiloDuplikaattiCriteria criteria) {
        List<Henkilo> henkilot = this.henkiloDataRepository.findDuplikaatit(criteria);
        return getHenkiloDuplicateDtoList(henkilot);
    }

    private List<HenkiloDuplicateDto> getHenkiloDuplicateDtoList(List<Henkilo> candidates) {
        String kayttajaOid = this.userDetailsHelper.getCurrentUserOid();
        List<HenkiloDuplicateDto> henkiloDuplicateDtos = this.mapper.mapAsList(candidates, HenkiloDuplicateDto.class)
                .stream().filter(henkiloDuplicate -> !henkiloDuplicate.getOidHenkilo().equals(kayttajaOid))
                .collect(toList()); // remove current user from duplicate search results
        List<String> duplicateOids = henkiloDuplicateDtos.stream().map(HenkiloDuplicateDto::getOidHenkilo)
                .collect(toList());
        Map<String, List<HakemusDto>> hakemukset = getApplications(duplicateOids);
        henkiloDuplicateDtos.forEach(duplicate -> duplicate
                .setHakemukset(hakemukset.getOrDefault(duplicate.getOidHenkilo(), Collections.emptyList())));
        return henkiloDuplicateDtos;
    }

    protected Map<String, List<HakemusDto>> getApplications(List<String> oids) {
        try {
            return oids.isEmpty() ? Collections.emptyMap()
                    : Stream.concat(
                            hakuappClient.fetchApplicationsByOid(oids).entrySet().stream(),
                            ataruClient.fetchApplicationsByOid(oids).entrySet().stream())
                            .collect(Collectors.toMap(
                                    Map.Entry::getKey,
                                    Map.Entry::getValue,
                                    (haku, ataru) -> Stream.concat(haku.stream(), ataru.stream()).collect(toList())));
        } catch (Exception e) {
            log.error("Failed to fetch applications for oids: {}", oids, e);
            return Collections.emptyMap();
        }
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public LinkResult removeDuplicateHetuAndLink(Henkilo henkilo, String hetu) {
        log.info("Checking for hetu duplicates for henkilo {}", henkilo.getOidHenkilo());
        return this.henkiloDataRepository.findByHetu(hetu)
                .filter((henkiloWithSameHetu) -> !henkiloWithSameHetu.getOidHenkilo().equals(henkilo.getOidHenkilo()))
                .map(oppijaWithSameHetu -> {
                    log.info("Found hetu duplicate; clearing duplicate's hetu and yksilöinti");
                    String[] oppijaWithSameHetuHetuhistoria = oppijaWithSameHetu.getKaikkiHetut()
                            .toArray(new String[0]);
                    oppijaWithSameHetu.clearHetut();
                    oppijaWithSameHetu.setHetu(null);
                    oppijaWithSameHetu.setYksiloity(false);
                    oppijaWithSameHetu.setYksiloityVTJ(false);
                    // Hetu is unique so we need to flush when moving it
                    this.henkiloDataRepository.saveAndFlush(oppijaWithSameHetu);
                    henkilo.addHetu(oppijaWithSameHetuHetuhistoria);
                    return this.linkHenkilos(henkilo.getOidHenkilo(),
                            Lists.newArrayList(oppijaWithSameHetu.getOidHenkilo()));
                })
                .orElse(new LinkResult(henkilo, Collections.singletonList(henkilo), Collections.emptyList()));
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public LinkResult linkWithHetu(Henkilo henkilo, String hetu) {
        return henkiloDataRepository.findByKaikkiHetut(hetu)
                .or(() -> henkiloDataRepository.findByHetu(hetu))
                .filter(henkiloByHetu -> !henkiloByHetu.equals(henkilo))
                .map(henkiloByHetu -> {
                    if (henkiloByHetu.isYksiloityVTJ() && (henkilo.isYksiloity() || henkilo.isYksiloityVTJ())) {
                        throw new ValidationException(
                                String.format("Henkilöitä %s ja %s ei voida yhdistää koska molemmat ovat jo yksilöity",
                                        henkilo.getOidHenkilo(), henkiloByHetu.getOidHenkilo()));
                    }
                    Henkilo master = henkilo;
                    Henkilo slave = henkiloByHetu;
                    if (henkiloByHetu.isYksiloityVTJ()) {
                        // pidetään yksilöity yksilöitynä
                        master = henkiloByHetu;
                        slave = henkilo;
                    }
                    slave.setHetu(null);
                    return this.linkHenkilos(master.getOidHenkilo(), Lists.newArrayList(slave.getOidHenkilo()));
                })
                .orElse(new LinkResult(henkilo, Collections.singletonList(henkilo), new ArrayList<>()));
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public LinkResult linkHenkilos(String henkiloOid, List<String> similarHenkiloOids) {
        log.info("Linkin henkilos {}, {}", henkiloOid, String.join(", ", similarHenkiloOids));
        henkiloDataRepository.findByOidHenkilo(henkiloOid).ifPresent(henkilo -> {
            if (henkilo.isDuplicate()) {
                throw new ValidationException("Henkilo " + henkiloOid + "is already a duplicate");
            }
        });

        similarHenkiloOids = similarHenkiloOids.stream().filter(oid -> !henkiloOid.equals(oid)).distinct()
                .collect(toList());

        Henkilo master = determineMasterHenkilo(henkiloOid, similarHenkiloOids);
        master.setPassivoitu(false);
        master.setDuplicate(false);

        List<String> slaveOids = similarHenkiloOids;
        if (!henkiloOid.equals(master.getOidHenkilo())) {
            // If person changed, make the original one of the slaves
            // (and if the resolved master was one of the original slaves, remove that):
            slaveOids.remove(master.getOidHenkilo());
            slaveOids.add(henkiloOid);
        }

        // If master previously was a slave, preserve the two-level hierarchy also in
        // this way so that
        // this new master will become the master of it's previous master (and its
        // possible other slaves):
        slaveOids.addAll(
                this.henkiloViiteRepository.findBySlaveOid(master.getOidHenkilo())
                        .stream()
                        .map(HenkiloViite::getMasterOid).collect(toSet()));

        LinkResult result = new LinkResult(
                master,
                Stream.concat(
                        slaveOids.stream().flatMap(oid -> this.linkHenkilos(master, oid).stream()),
                        Stream.of(master)).collect(toList()),
                slaveOids);
        auditlogAspectHelper.logLinkHenkilos(result);
        return result;
    }

    private List<Henkilo> linkHenkilos(Henkilo master, String slaveOid) {
        List<HenkiloViite> existingViittees = this.henkiloViiteRepository.findBySlaveOid(slaveOid);

        Predicate<HenkiloViite> relatesToGivenMaster = viite -> master.getOidHenkilo().equals(viite.getMasterOid());
        // Unlink slave from from possible previous master
        List<Henkilo> previousMasters = existingViittees.stream().filter(relatesToGivenMaster.negate())
                .flatMap(viite -> {
                    String masterOid = viite.getMasterOid();
                    this.henkiloViiteRepository.delete(viite);
                    return this.henkiloDataRepository.findByOidHenkilo(masterOid).stream();
                })
                .collect(toList());

        if (existingViittees.stream().anyMatch(relatesToGivenMaster)) {
            // No need to add new viite (already linked to the given master):
            return previousMasters;
        }

        HenkiloViite viite = new HenkiloViite();
        viite.setMasterOid(master.getOidHenkilo());
        viite.setSlaveOid(slaveOid);
        this.henkiloViiteRepository.save(viite);

        Henkilo duplicateHenkilo = this.henkiloDataRepository.findByOidHenkilo(slaveOid)
                .orElseThrow(() -> new NotFoundException("Henkilo not found with given oid " + slaveOid));
        duplicateHenkilo.setDuplicate(true);
        duplicateHenkilo.setPassivoitu(true);
        duplicateHenkilo.clearHuoltajat();
        // käyttäjä ei ole aina tiedossa (esim. yksilöinnin tausta-ajo)
        Optional<String> kasittelijaOid = this.userDetailsHelper.findCurrentUserOid();
        // Doesn't throw even if user doesn't exists in kayttooikeus-service
        this.kayttooikeusClient.passivoiHenkilo(duplicateHenkilo.getOidHenkilo(), kasittelijaOid.orElse(null));

        // Preserve two-level hierarchy, re-link slave's slaves to new master
        this.henkiloViiteRepository.findByMasterOid(slaveOid).forEach(slavesSlave -> {
            if (slavesSlave.getSlaveOid().equals(master.getOidHenkilo())) {
                this.henkiloViiteRepository.delete(slavesSlave);
            } else {
                slavesSlave.setMasterOid(master.getOidHenkilo());
            }
        });

        // Siirretään sähköpostitunnisteet slavelta masterille, jos kummallakaan ei ole
        // hetua
        if (!hasHetu(master) && !hasHetu(duplicateHenkilo)) {
            moveIdentificationsToMaster(master, duplicateHenkilo);
            master.getKansalaisuus().addAll(duplicateHenkilo.getKansalaisuus());
            if (master.getAidinkieli() == null) {
                master.setAidinkieli(duplicateHenkilo.getAidinkieli());
            }
        }

        return previousMasters;
    }

    private void moveIdentificationsToMaster(Henkilo master, Henkilo slave) {
        Set<Identification> masterIdentifications = master.getIdentifications();

        Set<Identification> slaveIdentifications = slave.getIdentifications();

        // Add slaves email identification to master
        masterIdentifications.addAll(slaveIdentifications.stream()
                .map(original -> {
                    Identification copy = mapper.map(original, Identification.class);
                    copy.setId(null);
                    return copy;
                }).collect(toSet()));

        // Remove email identification from slave
        slaveIdentifications.clear();
    }

    private Henkilo determineMasterHenkilo(String henkiloOid, List<String> similarHenkiloOids) {
        Henkilo originalMaster = this.henkiloDataRepository.findByOidHenkilo(henkiloOid)
                .orElseThrow(() -> new NotFoundException("User with oid " + henkiloOid + " was not found"));
        List<Henkilo> candidates = this.henkiloDataRepository.findByOidHenkiloIsIn(similarHenkiloOids);

        /*
         * Positively identified Henkilo MUST ALWAYS be the master
         * and only one identified Henkilo can be in the
         * similarHenkiloList/masterHenkilo
         * since it would cause ambiguous behavior in linking
         */
        List<Henkilo> allHenkilos = new ArrayList<>(candidates);
        allHenkilos.add(originalMaster);
        if (hasMoreThanOneIdentifiedHenkilo(allHenkilos)) {
            throw new ForbiddenException("More than one identified Henkilo");
        }

        // if there is one identified henkilo, set him as master - otherwise master will
        // be the henkilo whos oid was given as first parameter
        return candidates
                .stream()
                .reduce(originalMaster,
                        (currentMaster, candidate) -> isHenkiloIdentified(candidate) ? candidate : currentMaster);
    }

    private boolean hasMoreThanOneIdentifiedHenkilo(List<Henkilo> henkilos) {
        return henkilos.stream().filter(this::isHenkiloIdentified).count() > 1;
    }

    private boolean isHenkiloIdentified(Henkilo henkilo) {
        return henkilo.isYksiloity() || henkilo.isYksiloityVTJ() || hasHetu(henkilo);
    }

    private boolean hasHetu(Henkilo henkilo) {
        return henkilo.getHetu() != null;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public LinkResult unlinkHenkilo(String oid, String slaveOid) {
        Henkilo master = this.henkiloDataRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("User with oid " + oid + " was not found"));
        Henkilo slave = this.henkiloDataRepository.findByOidHenkilo(slaveOid)
                .orElseThrow(() -> new NotFoundException("User with oid " + oid + " was not found"));
        slave.setDuplicate(false);
        slave.setPassivoitu(false);
        this.henkiloViiteRepository.removeByMasterOidAndSlaveOid(oid, slaveOid);
        auditlogAspectHelper.logUnlinkHenkilos(oid, slaveOid);
        return new LinkResult(master, Lists.newArrayList(master, slave), new ArrayList<>());
    }

}
