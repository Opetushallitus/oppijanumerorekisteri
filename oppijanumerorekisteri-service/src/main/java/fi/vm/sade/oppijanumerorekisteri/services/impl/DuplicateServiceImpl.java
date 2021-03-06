package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
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
import fi.vm.sade.oppijanumerorekisteri.utils.OptionalUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

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

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDuplicateDto> findDuplicates(String oid) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oid).orElseThrow( () -> new NotFoundException("User with oid " + oid + " was not found") );
        HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(henkilo.getEtunimet(), henkilo.getKutsumanimi(), henkilo.getSukunimi(), henkilo.getSyntymaaika());
        List<Henkilo> candidates = this.henkiloDataRepository.findDuplikaatit(criteria).stream().filter(duplicate -> filterDuplicate(henkilo, duplicate)).collect(toList());
        return getHenkiloDuplicateDtoList(candidates);
    }

    public boolean filterDuplicate(Henkilo henkilo, Henkilo duplicate){
        boolean notSameOid =  !duplicate.getOidHenkilo().equals(henkilo.getOidHenkilo());
        boolean ytjIdentifiedfilter = !henkilo.isYksiloityVTJ() || henkilo.getHetu() == null || !duplicate.isYksiloityVTJ();

        return notSameOid && ytjIdentifiedfilter;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HakemusDto> getApplications(String oid) {
        Set<String> oids = Sets.newHashSet(oid);
        Map<String, List<HakemusDto>> hakuAppHakemukset = hakuappClient.fetchApplicationsByOid(oids);
        Map<String, List<HakemusDto>> ataruHakemukset = ataruClient.fetchApplicationsByOid(oids);
        List<HakemusDto> hakemukset = new ArrayList<>();
        if(hakuAppHakemukset.get(oid) != null) {
            hakemukset.addAll(hakuAppHakemukset.get(oid));
        }
        if(ataruHakemukset.get(oid) != null) {
            hakemukset.addAll(ataruHakemukset.get(oid));
        }
        return hakemukset;
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
                .stream().filter(henkiloDuplicate -> !henkiloDuplicate.getOidHenkilo().equals(kayttajaOid)).collect(toList()); // remove current user from duplicate search results
        Set<String> duplicateOids = henkiloDuplicateDtos.stream().map(HenkiloDuplicateDto::getOidHenkilo).collect(toSet());
        Map<String, List<HakemusDto>> hakuAppHakemukset = hakuappClient.fetchApplicationsByOid(duplicateOids);
        Map<String, List<HakemusDto>> ataruHakemukset = ataruClient.fetchApplicationsByOid(duplicateOids);

        henkiloDuplicateDtos.forEach(duplicate -> {
            String oidHenkilo = duplicate.getOidHenkilo();
            List<HakemusDto> hakemusDtos = new ArrayList<>();
            if (hakuAppHakemukset.get(oidHenkilo) != null) {
                hakemusDtos.addAll(hakuAppHakemukset.get(oidHenkilo));
            }
            if (ataruHakemukset.get(oidHenkilo) != null) {
                hakemusDtos.addAll(ataruHakemukset.get(oidHenkilo));
            }
            duplicate.setHakemukset(hakemusDtos);
        });

        return henkiloDuplicateDtos;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public LinkResult removeDuplicateHetuAndLink(Henkilo henkilo, String hetu) {
        return this.henkiloDataRepository.findByHetu(hetu)
                .filter((henkiloWithSameHetu) -> !henkiloWithSameHetu.getOidHenkilo().equals(henkilo.getOidHenkilo()))
                .map(oppijaWithSameHetu -> {
                    String[] oppijaWithSameHetuHetuhistoria = oppijaWithSameHetu.getKaikkiHetut().toArray(new String[oppijaWithSameHetu.getKaikkiHetut().size()]);
                    oppijaWithSameHetu.clearHetut();
                    oppijaWithSameHetu.setHetu(null);
                    oppijaWithSameHetu.setYksiloity(false);
                    oppijaWithSameHetu.setYksiloityVTJ(false);
                    // Hetu is unique so we need to flush when moving it
                    this.henkiloDataRepository.saveAndFlush(oppijaWithSameHetu);
                    henkilo.addHetu(oppijaWithSameHetuHetuhistoria);
                    return this.linkHenkilos(henkilo.getOidHenkilo(), Lists.newArrayList(oppijaWithSameHetu.getOidHenkilo()));
                })
                .orElse(new LinkResult(henkilo, Collections.singletonList(henkilo), Collections.emptyList()));
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public LinkResult linkWithHetu(Henkilo henkilo, String hetu) {
        return OptionalUtils.or(henkiloDataRepository.findByKaikkiHetut(hetu), () -> henkiloDataRepository.findByHetu(hetu))
                .filter(henkiloByHetu -> !henkiloByHetu.equals(henkilo))
                .map(henkiloByHetu -> {
                    if (henkiloByHetu.isYksiloityVTJ() && (henkilo.isYksiloity() || henkilo.isYksiloityVTJ())) {
                        throw new ValidationException(String.format("Henkilöitä %s ja %s ei voida yhdistää koska molemmat ovat jo yksilöity",
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
        similarHenkiloOids = similarHenkiloOids.stream().filter( oid -> !henkiloOid.equals(oid)).distinct().collect(toList());

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

        // If master previously was a slave, preserve the two-level hierarchy also in this way so that
        // this new master will become the master of it's previous master (and its possible other slaves):
        slaveOids.addAll(
                this.henkiloViiteRepository.findBySlaveOid(master.getOidHenkilo())
                        .stream()
                        .map(HenkiloViite::getMasterOid).collect(toSet()));

        return new LinkResult(
                master,
                Stream.concat(
                        slaveOids.stream().flatMap(oid -> this.linkHenkilos(master, oid).stream()),
                        Stream.of(master)
                ).collect(toList()),
                slaveOids
        );
    }

    private List<Henkilo> linkHenkilos(Henkilo master, String slaveOid) {
        List<HenkiloViite> existingViittees = this.henkiloViiteRepository.findBySlaveOid(slaveOid);

        Predicate<HenkiloViite> relatesToGivenMaster = viite -> master.getOidHenkilo().equals(viite.getMasterOid());
        // Unlink slave from from possible previous master
        List<Henkilo> previousMasters = existingViittees.stream().filter(relatesToGivenMaster.negate())
                .flatMap(viite -> {
                    String masterOid = viite.getMasterOid();
                    this.henkiloViiteRepository.delete(viite);
                    return this.henkiloDataRepository.findByOidHenkilo(masterOid)
                            .map(Stream::of).orElse(Stream.empty());
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
                .orElseThrow( () -> new NotFoundException("Henkilo not found with given oid " + slaveOid) );
        duplicateHenkilo.setDuplicate(true);
        duplicateHenkilo.setPassivoitu(true);
        duplicateHenkilo.clearHuoltajat();
        // käyttäjä ei ole aina tiedossa (esim. yksilöinnin tausta-ajo)
        Optional<String> kasittelijaOid = this.userDetailsHelper.findCurrentUserOid();
        // Doesn't throw even if user doesn't exists in kayttooikeus-service
        this.kayttooikeusClient.passivoiHenkilo(duplicateHenkilo.getOidHenkilo(), kasittelijaOid.orElse(null));

        // Preserve two-level hierarchy, re-link slave's slaves to new master
        this.henkiloViiteRepository.findByMasterOid(slaveOid).forEach( slavesSlave -> {
            if (slavesSlave.getSlaveOid().equals(master.getOidHenkilo())) {
                this.henkiloViiteRepository.delete(slavesSlave);
            } else {
                slavesSlave.setMasterOid(master.getOidHenkilo());
            }
        });

        // Siirretään sähköpostitunnisteet slavelta masterille, jos kummallakaan ei ole hetua
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
                .orElseThrow( () -> new NotFoundException("User with oid " + henkiloOid + " was not found"));
        List<Henkilo> candidates = this.henkiloDataRepository.findByOidHenkiloIsIn(similarHenkiloOids);

        /* Positively identified Henkilo MUST ALWAYS be the master
         * and only one identified Henkilo can be in the similarHenkiloList/masterHenkilo
         * since it would cause ambiguous behavior in linking
         */
        List<Henkilo> allHenkilos = new ArrayList<>(candidates);
        allHenkilos.add(originalMaster);
        if (hasMoreThanOneIdentifiedHenkilo(allHenkilos)) {
            throw new ForbiddenException("More than one identified Henkilo");
        }

        // if there is one identified henkilo, set him as master - otherwise master will be the henkilo whos oid was given as first parameter
        return candidates
                .stream()
                .reduce( originalMaster, (currentMaster, candidate) -> isHenkiloIdentified(candidate) ? candidate : currentMaster );
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
                .orElseThrow( () -> new NotFoundException("User with oid " + oid + " was not found"));
        Henkilo slave = this.henkiloDataRepository.findByOidHenkilo(slaveOid)
                .orElseThrow( () -> new NotFoundException("User with oid " + oid + " was not found"));
        slave.setDuplicate(false);
        slave.setPassivoitu(false);
        this.henkiloViiteRepository.removeByMasterOidAndSlaveOid(oid, slaveOid);
        return new LinkResult(master, Lists.newArrayList(master, slave), new ArrayList<>());
    }

}
