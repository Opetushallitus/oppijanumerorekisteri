package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import com.querydsl.core.types.Predicate;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HuoltajasuhdeRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.util.batchprocessing.BatchProcessor;
import fi.vm.sade.oppijanumerorekisteri.util.batchprocessing.BatchingProcess;
import lombok.RequiredArgsConstructor;
import ma.glasnost.orika.metadata.TypeBuilder;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Collections.emptyList;
import static org.springframework.util.CollectionUtils.isEmpty;

@Service
@RequiredArgsConstructor
public class HenkiloServiceImpl implements HenkiloService {
    public static final int MAX_FETCH_PERSONS = 5000;

    private final HenkiloRepository henkiloDataRepository;
    private final HenkiloViiteRepository henkiloViiteRepository;

    private final OrikaConfiguration mapper;
    private final UserDetailsHelper userDetailsHelper;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    private final KayttooikeusClient kayttooikeusClient;

    private final HuoltajasuhdeRepository huoltajasuhdeRepository;

    @Override
    @Transactional(readOnly = true)
    public Slice<HenkiloMunicipalDobDto> findByMunicipalAndBirthdate(final String municipal, final LocalDate dob, final int page) {
        Long limit = MAX_FETCH_PERSONS + 1L;
        Long offset = (page - 1L) * MAX_FETCH_PERSONS;
        return Slice.of(page, MAX_FETCH_PERSONS, henkiloDataRepository.findByMunicipalAndBirthdate(municipal, dob, limit, offset));
    }

    @Override
    @Transactional
    public void removeContactInfo(String oid, String... removeTypes) {
        Optional<Henkilo> henkilo = henkiloDataRepository.findByOidHenkilo(oid);
        if ( henkilo.isPresent() ) {
            henkilo.get().getYhteystiedotRyhma()
                    .removeIf(contactInfo -> List.of(removeTypes).contains(contactInfo.getRyhmaKuvaus()));
        }
    }

    @Override
    @Transactional
    public Set<String> setPassportNumbers(String oid, Set<String> passinumerot) {
        getEntityByOid(oid).setPassinumerot(passinumerot);
        return passinumerot;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloHakuPerustietoDto> list(HenkiloHakuCriteriaDto criteria, Long offset, Long limit) {
        return this.henkiloDataRepository.findPerustietoBy(this.createHenkiloCriteria(criteria), limit, offset);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<HenkiloHakuDto> list(HenkiloHakuCriteria criteria, int page, int count) {
        KayttooikeudetDto kayttooikeudet = getKayttooikeudet(criteria);
        if (kayttooikeudet.getOids().map(Collection::isEmpty).orElse(false)) {
            // käyttäjällä ei ole oikeuksia yhdenkään henkilön tietoihin
            return Slice.empty(page, count);
        }
        HenkiloCriteria henkiloCriteria = createHenkiloCriteria(criteria, kayttooikeudet);

        // haetaan yksi ylimääräinen rivi, jotta voidaan päätellä onko seuraavaa viipaletta
        Long limit = count + 1L;
        Long offset = (page - 1L) * count;
        return Slice.of(page, count, henkiloDataRepository.findBy(henkiloCriteria, limit, offset));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloYhteystiedotDto> listWithYhteystiedotAsAdmin(HenkiloCriteria criteria) {
        if (criteria.getHenkiloOids() == null) {
            throw new ValidationException("Pakollinen hakuehto 'henkiloOids' puuttuu");
        }
        if (criteria.getHenkiloOids().isEmpty()) {
            return emptyList();
        }
        return mapper.map(henkiloDataRepository.findWithYhteystiedotBy(criteria),
                new TypeBuilder<List<HenkiloYhteystietoDto>>() {}.build(),
                new TypeBuilder<List<HenkiloYhteystiedotDto>>() {}.build());
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloHakuDto getByHakutermi(String hakutermi) {
        OppijaCriteria criteria = OppijaCriteria.builder()
                .passivoitu(false).duplikaatti(false)
                .hakutermi(hakutermi).build();
        List<HenkiloHakuDto> henkilot = henkiloDataRepository.findBy(criteria, 1L, 0L);

        if (henkilot.isEmpty() || henkilot.size() > 1) {
            throw new NotFoundException("Henkilöä ei löytynyt hakuehdoilla");
        }

        return henkilot.get(0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listOidByYhteystieto(String arvo) {
        return henkiloDataRepository.findOidByYhteystieto(arvo);
    }

    private KayttooikeudetDto getKayttooikeudet(HenkiloHakuCriteria criteria) {
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        OrganisaatioCriteria organisaatioCriteria = mapper.map(criteria, OrganisaatioCriteria.class);
        organisaatioCriteria.setPassivoitu(false); // haetaan aina voimassaolevat käyttöoikeudet
        return kayttooikeusClient.getHenkiloKayttooikeudet(kayttajaOid, organisaatioCriteria);
    }

    private HenkiloCriteria createHenkiloCriteria(Object criteria) {
        return this.mapper.map(criteria, HenkiloCriteria.class);
    }

    private HenkiloCriteria createHenkiloCriteria(Object criteria, KayttooikeudetDto kayttooikeudet) {
        HenkiloCriteria henkiloCriteria = this.createHenkiloCriteria(criteria);
        kayttooikeudet.getOids().ifPresent(henkiloOids -> {
            if (isEmpty(henkiloCriteria.getHenkiloOids())) {
                henkiloCriteria.setHenkiloOids(henkiloOids);
            } else {
                henkiloCriteria.getHenkiloOids().retainAll(henkiloOids);
            }
        });
        return henkiloCriteria;
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean getHasHetu() {
        Optional<String> hetu = this.henkiloDataRepository.findHetuByOid(this.userDetailsHelper.getCurrentUserOid());
        return !hetu.orElse("").isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean getOidExists(String oid) {
        Predicate searchPredicate = QHenkilo.henkilo.oidHenkilo.eq(oid);
        return this.henkiloDataRepository.exists(searchPredicate);
    }

    @Override
    @Transactional(readOnly = true)
    public String getOidByHetu(String hetu) {
        return henkiloDataRepository.findOidByHetu(hetu)
                .or(() -> this.henkiloDataRepository.findOidByKaikkiHetut(hetu))
                .orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public String getOidByEidasTunniste(String eidasTunniste) {
        return henkiloDataRepository.findByEidasTunniste(eidasTunniste)
                .orElseThrow(NotFoundException::new)
                .getOidHenkilo();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids) {
        if(oids.size() > MAX_FETCH_PERSONS) {
            throw new IllegalArgumentException("Maximum amount of henkilös to be fetched is " + MAX_FETCH_PERSONS + ". Tried to fetch:" + oids.size());
        }

        return henkiloDataRepository
                .eagerFindByOidHenkiloIn(new HashSet<>(oids))
                .stream()
                .map(h -> mapper.map(h, HenkiloPerustietoDto.class))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDto> getHenkilosByOids(List<String> oids) {
        if(oids.size() > MAX_FETCH_PERSONS) {
            throw new IllegalArgumentException("Maximum amount of henkilös to be fetched is " + MAX_FETCH_PERSONS + ". Tried to fetch:" + oids.size());
        }

        BatchingProcess<String, Henkilo> process = (batch) -> this.henkiloDataRepository.findByOidHenkiloIsIn(batch);
        return this.mapper.mapAsList(BatchProcessor.execute(oids, BatchProcessor.postgreSqlMaxBindVariables, process), HenkiloDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloHakuDto getHenkiloOidHetuNimiByHetu(String hetu) {
        return henkiloDataRepository.findByHetu(hetu)
                .or(() -> henkiloDataRepository.findByKaikkiHetut(hetu))
                .map(h -> mapper.map(h, HenkiloHakuDto.class))
                .orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloDto getHenkiloByIDPAndIdentifier(IdpEntityId idp, String identifier) {
        Henkilo henkilo = this.henkiloDataRepository.findByIdentification(IdentificationDto.of(idp, identifier))
                .orElseThrow(NotFoundException::new);
        return this.mapper.map(henkilo, HenkiloDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloViiteDto> findHenkiloViittees(Set<String> oids) {
        List<HenkiloViiteDto> henkiloViiteDtoList = new ArrayList<>();
        if (oids != null) {
            Lists.partition(
                            new ArrayList<>(oids),
                            oppijanumerorekisteriProperties.getHenkiloViiteSplitSize())
                    .forEach(henkiloOidList -> henkiloViiteDtoList.addAll(this.henkiloViiteRepository.findBy(new HashSet<>(henkiloOidList))));
        } else {
            henkiloViiteDtoList.addAll(this.henkiloViiteRepository.findBy(Set.of()));
        }
        return henkiloViiteDtoList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> findHenkiloOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount) {
        return this.henkiloDataRepository.findOidsModifiedSince(criteria, modifiedSince, offset, amount);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloDto getMasterByOid(String henkiloOid) {
        Henkilo henkilo = henkiloDataRepository
                .findMasterBySlaveOid(henkiloOid)
                .orElseGet(() -> getEntityByOid(henkiloOid));
        return mapper.map(henkilo, HenkiloDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, HenkiloDto> getMastersByOids(Set<String> henkiloOids) {
        if(henkiloOids.size() > MAX_FETCH_PERSONS) {
            throw new IllegalArgumentException("Maximum amount of henkilös to be fetched is " + MAX_FETCH_PERSONS + ". Tried to fetch:" + henkiloOids.size());
        }

        return henkiloDataRepository
                .findMastersByOids(henkiloOids)
                .entrySet()
                .stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> mapper.map(e.getValue(), HenkiloDto.class)));
    }

    @Override
    @Transactional(readOnly = true)
    public Henkilo getEntityByOid(String henkiloOid) {
        return henkiloDataRepository
                .findByOidHenkilo(henkiloOid)
                .orElseThrow(() -> new NotFoundException("Henkilöä ei löytynyt OID:lla " + henkiloOid));
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloDto getByHetu(String hetu) {
        Henkilo henkilo = findByHetu(hetu)
                .orElseThrow(() -> new NotFoundException("Henkilöä ei löytynyt henkilötunnuksella " + hetu));
        return mapper.map(henkilo, HenkiloDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDto> findSlavesByMasterOid(String masterOid) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findSlavesByMasterOid(masterOid);
        return henkilos.stream().map( h -> mapper.map(h, HenkiloDto.class)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public String getAsiointikieli(String oidHenkilo) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oidHenkilo)
                .orElseThrow(() -> new NotFoundException("Henkilo not found with oid " + oidHenkilo));
        return UserDetailsHelperImpl.getAsiointikieliOrDefault(henkilo);
    }

    @Override
    @Transactional(readOnly = true)
    public String getCurrentUserAsiointikieli() {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(this.userDetailsHelper.getCurrentUserOid())
                .orElseThrow(() -> new NotFoundException("Henkilo not found with oid " + this.userDetailsHelper.getCurrentUserOid()));
        return UserDetailsHelperImpl.getAsiointikieliOrDefault(henkilo);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloOmattiedotDto getOmatTiedot() {
        return this.getOmatTiedot(this.userDetailsHelper.getCurrentUserOid());
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloOmattiedotDto getOmatTiedot(String oidHenkilo) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oidHenkilo)
                .orElseThrow(() -> new NotFoundException("Henkilo not found with oid " + this.userDetailsHelper.getCurrentUserOid()));
        return this.mapper.map(henkilo, HenkiloOmattiedotDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietoByHetus(List<String> hetus) {
        if (hetus.size() > MAX_FETCH_PERSONS) {
            throw new IllegalArgumentException("Maximum amount of henkilös to be fetched is " + MAX_FETCH_PERSONS + ". Tried to fetch:" + hetus.size());
        }
        return henkiloDataRepository
                .eagerFindByHetuIn(new HashSet<>(hetus))
                .stream()
                .map(h -> mapper.map(h, HenkiloPerustietoDto.class))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HuoltajaDto> getHenkiloHuoltajat(String oidHenkilo){
        List<HenkiloHuoltajaSuhde> huoltajaSuhteet = huoltajasuhdeRepository.findCurrentHuoltajatByHenkilo(oidHenkilo);

        if (huoltajaSuhteet.size() == 0) {
            return Collections.emptyList();
        }

        return huoltajaSuhteet
            .stream()
            .map( hs -> {
                Henkilo huoltaja = hs.getHuoltaja();
                HuoltajaDto huoltajaDto = mapper.map( huoltaja, HuoltajaDto.class );

                if (huoltaja.isTurvakielto()) {
                    huoltajaDto.setYhteystiedotRyhma(new HashSet<>());
                }

                return huoltajaDto;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Set<String> getHuoltajaSuhdeMuutokset(LocalDate start, LocalDate end) {
        List<HenkiloHuoltajaSuhde> suhteet = huoltajasuhdeRepository.changesBetween(start, end);

        return suhteet.stream()
                .map( hs -> {
                    return hs.getLapsi().getOidHenkilo();
                })
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getHuoltajaSuhdeMuutokset(DateTime modifiedSince, Integer amount, Integer offset) {
        return huoltajasuhdeRepository.changesSince(modifiedSince, amount, offset);

    }

    @Override
    public List<KotikuntaHistoria> getKotikuntaHistoria(List<String> oids) {
        return henkiloDataRepository.findKotikuntaHistorias(oids);
    }

    @Override
    public List<KotikuntaHistoria> getTurvakieltoKotikuntaHistoria(List<String> oids) {
        return henkiloDataRepository.findTurvakieltoKotikuntaHistorias(oids);
    }

    private Optional<Henkilo> findByHetu(String hetu) {
        return henkiloDataRepository.findByHetu(hetu)
                .or(() -> henkiloDataRepository.findByKaikkiHetut(hetu));
    }
}
