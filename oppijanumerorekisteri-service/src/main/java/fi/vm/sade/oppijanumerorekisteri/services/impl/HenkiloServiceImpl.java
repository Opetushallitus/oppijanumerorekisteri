package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import com.querydsl.core.types.Predicate;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.utils.OptionalUtils;
import lombok.RequiredArgsConstructor;
import ma.glasnost.orika.metadata.TypeBuilder;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
import static org.springframework.util.CollectionUtils.isEmpty;

@Service
@RequiredArgsConstructor
public class HenkiloServiceImpl implements HenkiloService {
    public static final int MAX_FETCH_PERSONS = 5000;

    private final HenkiloRepository henkiloDataRepository;
    private final HenkiloViiteRepository henkiloViiteRepository;

    private final YhteystietoConverter yhteystietoConverter;
    private final OrikaConfiguration mapper;
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    private final KayttooikeusClient kayttooikeusClient;



    @Override
    @Transactional(readOnly = true)
    public Iterable<HenkiloHakuDto> list(HenkiloHakuCriteria criteria, Long offset, Long limit) {
        KayttooikeudetDto kayttooikeudet = getKayttooikeudet(criteria);
        if (kayttooikeudet.getOids().map(Collection::isEmpty).orElse(false)) {
            // käyttäjällä ei ole oikeuksia yhdenkään henkilön tietoihin
            return emptyList();
        }
        HenkiloCriteria henkiloCriteria = createHenkiloCriteria(criteria, kayttooikeudet);

        return henkiloDataRepository.findBy(henkiloCriteria, limit, offset);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<HenkiloHakuPerustietoDto> list(HenkiloHakuCriteriaDto criteria, Long offset, Long limit) {
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
    public Iterable<HenkiloYhteystiedotDto> listWithYhteystiedot(HenkiloHakuCriteria criteria) {
        KayttooikeudetDto kayttooikeudet = getKayttooikeudet(criteria);
        if (kayttooikeudet.getOids().map(Collection::isEmpty).orElse(false)) {
            // käyttäjällä ei ole oikeuksia yhdenkään henkilön tietoihin
            return emptyList();
        }
        HenkiloCriteria henkiloCriteria = createHenkiloCriteria(criteria, kayttooikeudet);

        return mapper.map(henkiloDataRepository.findWithYhteystiedotBy(henkiloCriteria),
                new TypeBuilder<List<HenkiloYhteystietoDto>>() {}.build(),
                new TypeBuilder<List<HenkiloYhteystiedotDto>>() {}.build());
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<HenkiloYhteystiedotDto> listWithYhteystiedotAsAdmin(HenkiloCriteria criteria) {
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
    public HenkiloHakuDto getByHakutermi(String hakutermi, ExternalPermissionService externalPermissionService) {
        OppijaCriteria criteria = OppijaCriteria.builder()
                .passivoitu(false).duplikaatti(false)
                .hakutermi(hakutermi).build();
        List<HenkiloHakuDto> henkilot = henkiloDataRepository.findBy(criteria, 1L, 0L);

        if (henkilot.isEmpty() || henkilot.size() > 1) {
            throw new NotFoundException("Henkilöä ei löytynyt hakuehdoilla");
        }
        HenkiloHakuDto henkilo = henkilot.get(0);
        if (!isAllowedToAccessPerson(henkilo.getOidHenkilo(), externalPermissionService)) {
            throw new ForbiddenException("Henkilön tietoihin ei oikeuksia");
        }

        return henkilo;
    }

    private boolean isAllowedToAccessPerson(String henkiloOid, ExternalPermissionService externalPermissionService) {
        try {
            List<String> sallitutRoolit = Stream
                    .of("READ", "READ_UPDATE", "CRUD", "KKVASTUU", "OPHREKISTERI")
                    .collect(toList());
            return permissionChecker.isAllowedToAccessPerson(henkiloOid, sallitutRoolit, externalPermissionService);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<String> listOidByYhteystieto(String arvo) {
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
        return OptionalUtils.or(this.henkiloDataRepository.findOidByHetu(hetu),
                () -> this.henkiloDataRepository.findOidByYksiloityHetu(hetu))
                .orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids) {
        if(oids.size() > MAX_FETCH_PERSONS) {
            throw new IllegalArgumentException("Maximum amount of henkilös to be fetched is " + MAX_FETCH_PERSONS + ". Tried to fetch:" + oids.size());
        }

        return this.henkiloDataRepository.findByOidIn(oids);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDto> getHenkilosByOids(List<String> oids) {
        return this.mapper.mapAsList(this.henkiloDataRepository.findByOidHenkiloIsIn(oids), HenkiloDto.class);
    }


    @Override
    @Transactional(readOnly = true)
    public List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi) {
        List<String> etunimetList = Arrays.stream(etunimet.split(" ")).collect(Collectors.toList());
        List<Henkilo> henkilos = this.henkiloDataRepository.findHenkiloOidHetuNimisByEtunimetOrSukunimi(etunimetList, sukunimi);
        return this.mapper.mapAsList(henkilos, HenkiloOidHetuNimiDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu) {
        return OptionalUtils.or(henkiloDataRepository.findOidHetuNimiByHetu(hetu),
                () -> henkiloDataRepository.findOidHetuNimiByYksiloityHetu(hetu))
                .orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(@NotNull String henkiloOid) {
        return new HenkilonYhteystiedotViewDto(yhteystietoConverter.toHenkiloYhteystiedot(
                this.henkiloDataRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid(henkiloOid))
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<YhteystiedotDto> getHenkiloYhteystiedot(@NotNull String henkiloOid, @NotNull String ryhma) {
        return Optional.ofNullable(yhteystietoConverter.toHenkiloYhteystiedot(
                this.henkiloDataRepository.findYhteystiedot(new YhteystietoCriteria()
                        .withHenkiloOid(henkiloOid)
                        .withRyhma(ryhma))
        ).get(ryhma));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit) {
        List<Henkilo> hetusAndOids = this.henkiloDataRepository.findHetusAndOids(syncedBeforeTimestamp, offset, limit);
        return mapper.mapAsList(hetusAndOids, HenkiloHetuAndOidDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier) {
        Henkilo henkilo = this.henkiloDataRepository.findByIdentification(IdentificationDto.of(idp, identifier))
                .orElseThrow(NotFoundException::new);
        return this.mapper.map(henkilo, HenkiloDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listPossibleHenkiloTypesAccessible() {
        if (this.permissionChecker.isSuperUser()) {
            return Arrays.stream(HenkiloTyyppi.values()).map(HenkiloTyyppi::toString).collect(Collectors.toList());
        }
        return Collections.singletonList(HenkiloTyyppi.VIRKAILIJA.toString());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloViiteDto> findHenkiloViittees(HenkiloCriteria criteria) {
        List<HenkiloViiteDto> henkiloViiteDtoList = new ArrayList<>();
        if(criteria.getHenkiloOids() != null) {
            List<List<String>> henkiloOidListSplit = Lists.partition(
                    new ArrayList<>(criteria.getHenkiloOids()),
                    oppijanumerorekisteriProperties.getHenkiloViiteSplitSize());
            henkiloOidListSplit.forEach(henkiloOidList -> {
                criteria.setHenkiloOids(new HashSet<>(henkiloOidList));
                henkiloViiteDtoList.addAll(this.henkiloViiteRepository.findBy(criteria));
            });
        }
        else {
            henkiloViiteDtoList.addAll(this.henkiloViiteRepository.findBy(criteria));
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
    public HenkiloReadDto getMasterByOid(String henkiloOid) {
        Henkilo henkilo = henkiloDataRepository
                .findMasterBySlaveOid(henkiloOid)
                .orElseGet(() -> getEntityByOid(henkiloOid));
        return mapper.map(henkilo, HenkiloReadDto.class);
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
    public HenkiloReadDto getByHetu(String hetu) {
        Henkilo henkilo = OptionalUtils.or(henkiloDataRepository.findByHetu(hetu),
                () -> henkiloDataRepository.findByYksiloityHetu(hetu))
                .orElseThrow(() -> new NotFoundException("Henkilöä ei löytynyt henkilötunnuksella " + hetu));
        return mapper.map(henkilo, HenkiloReadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloReadDto> findSlavesByMasterOid(String masterOid) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findSlavesByMasterOid(masterOid);
        return henkilos.stream().map( h -> mapper.map(h, HenkiloReadDto.class)).collect(Collectors.toList());
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
        return this.henkiloDataRepository.findPerustiedotByHetuIn(hetus);
    }
}
