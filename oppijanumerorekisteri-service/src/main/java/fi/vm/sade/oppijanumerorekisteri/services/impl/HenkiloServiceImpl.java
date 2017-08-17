package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloYhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Slice;
import fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper;
import com.google.common.collect.Lists;
import com.querydsl.core.types.Predicate;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import static fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper.created;
import static fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper.found;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindException;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.*;
import static java.util.Collections.emptyList;
import java.util.stream.Collectors;

import java.util.function.Function;
import static java.util.stream.Collectors.toList;
import java.util.stream.Stream;
import ma.glasnost.orika.metadata.TypeBuilder;
import org.joda.time.DateTime;

import static java.util.stream.Collectors.toSet;
import static org.springframework.util.CollectionUtils.isEmpty;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class HenkiloServiceImpl implements HenkiloService {
    private final HenkiloJpaRepository henkiloJpaRepository;
    private final HenkiloRepository henkiloDataRepository;
    private final HenkiloViiteRepository henkiloViiteRepository;
    private final KielisyysRepository kielisyysRepository;
    private final KansalaisuusRepository kansalaisuusRepository;

    private final YhteystietoConverter yhteystietoConverter;
    private final OrikaConfiguration mapper;
    private final OidGenerator oidGenerator;
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;
    private final HenkiloUpdatePostValidator henkiloUpdatePostValidator;
    private final HenkiloCreatePostValidator henkiloCreatePostValidator;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    private final KayttooikeusClient kayttooikeusClient;
    private final HakuappClient hakuappClient;


    @Override
    @Transactional(readOnly = true)
    public Iterable<HenkiloHakuDto> list(HenkiloHakuCriteria criteria, Long offset, Long limit) {
        KayttooikeudetDto kayttooikeudet = getKayttooikeudet(criteria);
        if (kayttooikeudet.getOids().map(Collection::isEmpty).orElse(false)) {
            // käyttäjällä ei ole oikeuksia yhdenkään henkilön tietoihin
            return emptyList();
        }
        HenkiloCriteria henkiloCriteria = createHenkiloCriteria(criteria, kayttooikeudet);

        return henkiloJpaRepository.findBy(henkiloCriteria, limit, offset);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<HenkiloHakuPerustietoDto> list(HenkiloHakuCriteriaDto criteria, Long offset, Long limit) {
        return this.henkiloJpaRepository.findPerustietoBy(this.createHenkiloCriteria(criteria), limit, offset);
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
        return Slice.of(page, count, henkiloJpaRepository.findBy(henkiloCriteria, limit, offset));
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

        return mapper.map(henkiloJpaRepository.findWithYhteystiedotBy(henkiloCriteria),
                new TypeBuilder<List<HenkiloYhteystietoDto>>() {}.build(),
                new TypeBuilder<List<HenkiloYhteystiedotDto>>() {}.build());
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloHakuDto getByHakutermi(String hakutermi, ExternalPermissionService externalPermissionService) {
        OppijaCriteria criteria = OppijaCriteria.builder()
                .passivoitu(false).duplikaatti(false)
                .hakutermi(hakutermi).build();
        List<HenkiloHakuDto> henkilot = henkiloJpaRepository.findBy(criteria, 1L, 0L);

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
        return henkiloJpaRepository.findOidByYhteystieto(arvo);
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
        Optional<String> hetu = this.henkiloJpaRepository.findHetuByOid(this.userDetailsHelper.getCurrentUserOid());
        return !hetu.orElse("").isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean getOidExists(String oid) {
        Predicate searchPredicate = QHenkilo.henkilo.oidHenkilo.eq(oid);
        return this.henkiloDataRepository.exists(searchPredicate);
    }

    @Override
    @Transactional
    public Henkilo disableHenkilo(String oid) throws IOException {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("Henkilö not found"));
        henkilo.setPassivoitu(true);
        String kasittelija = SecurityContextHolder.getContext().getAuthentication().getName();

        this.kayttooikeusClient.passivoiHenkilo(oid, kasittelija);
        return henkilo;
    }


    @Override
    @Transactional(readOnly = true)
    public String getOidByHetu(String hetu) {
        return this.henkiloJpaRepository.findOidByHetu(hetu).orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids) {
        return this.henkiloJpaRepository.findByOidIn(oids);
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
        List<Henkilo> henkilos = this.henkiloJpaRepository.findHenkiloOidHetuNimisByEtunimetOrSukunimi(etunimetList, sukunimi);
        return this.mapper.mapAsList(henkilos, HenkiloOidHetuNimiDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu) {
        return henkiloJpaRepository.findOidHetuNimiByHetu(hetu).orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional
    public FindOrCreateWrapper<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto) {
        return findHenkilo(henkiloPerustietoDto)
                .map(entity -> found(this.mapper.map(entity, HenkiloPerustietoDto.class)))
                .orElseGet(() -> created(this.createHenkilo(henkiloPerustietoDto)));
    }

    private Optional<Henkilo> findHenkilo(HenkiloPerustietoDto henkiloPerustietoDto) {
        return Stream.<Function<HenkiloPerustietoDto, Optional<Henkilo>>>of(
                dto -> Optional.ofNullable(dto.getOidHenkilo()).flatMap(oid -> Optional.of(getEntityByOid(oid))),
                dto -> Optional.ofNullable(dto.getExternalIds()).flatMap(externalIds -> findUnique(henkiloJpaRepository.findByExternalIds(externalIds))),
                dto -> Optional.ofNullable(dto.getIdentifications()).flatMap(identifications -> findUnique(henkiloJpaRepository.findByIdentifications(identifications))),
                dto -> Optional.ofNullable(dto.getHetu()).flatMap(henkiloDataRepository::findByHetu)
        ).map(transformer -> transformer.apply(henkiloPerustietoDto))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .findFirst();
    }

    private Optional<Henkilo> findUnique(Collection<Henkilo> henkilot) {
        Iterator<Henkilo> iterator = henkilot.iterator();
        if (!iterator.hasNext()) {
            return Optional.empty();
        }
        Henkilo henkilo = iterator.next();
        if (iterator.hasNext()) {
            throw new IllegalArgumentException("Annetuilla tunnisteilla löytyi useita henkilöitä");
        }
        return Optional.of(henkilo);
    }

    private HenkiloPerustietoDto createHenkilo(HenkiloPerustietoDto dto) {
        Henkilo entity = this.mapper.map(dto, Henkilo.class);
        entity = this.createHenkilo(entity);
        return this.mapper.map(entity, HenkiloPerustietoDto.class);
    }

    @Override
    @Transactional
    public List<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(List<HenkiloPerustietoDto> henkilot) {
        // Suorituskyvyn kannalta olisi järkevämpää hakea henkilöt ensin
        // tunnisteiden avulla ja vasta sitten luoda uudet henkilöt. Tässä
        // tapauksessa tunnisteita on kuitenkin useita (oid, externalid,
        // identification, hetu), jolloin toteutuksesta tulisi tarpeettoman
        // monimutkainen ylläpidon kannalta.
        return henkilot.stream()
                .map(this::findOrCreateHenkiloFromPerustietoDto)
                .map(FindOrCreateWrapper::getDto)
                .collect(toList());
    }

    @Override
    @Transactional
    public HenkiloDto createHenkilo(HenkiloCreateDto henkiloDto) {
        Henkilo henkilo = this.mapper.map(henkiloDto, Henkilo.class);
        return this.mapper.map(this.createHenkilo(henkilo), HenkiloDto.class);
    }

    // Mapper is configured to ignore null values so setting henkiloUpdateDto field to null is same as skipping the field.
    // If one wishes to enable validation groups with hibernate one needs to disable automatic validation and manually
    // call the validator.
    @Override
    @Transactional
    public HenkiloUpdateDto updateHenkilo(HenkiloUpdateDto henkiloUpdateDto) {
        BindException errors = new BindException(henkiloUpdateDto, "henkiloUpdateDto");
        this.henkiloUpdatePostValidator.validate(henkiloUpdateDto, errors);
        if (errors.hasErrors()) {
            throw new UnprocessableEntityException(errors);
        }

        Henkilo henkiloSaved = this.henkiloDataRepository.findByOidHenkiloIsIn(
                    Lists.newArrayList(henkiloUpdateDto.getOidHenkilo()))
                .stream().findFirst().orElseThrow(NotFoundException::new);

        henkiloSaved.setModified(new Date());
        henkiloSaved.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());

        // Do not update all values if henkilo is already vtj yksiloity
        if (henkiloSaved.isYksiloityVTJ()) {
            henkiloUpdateDto.setEtunimet(null);
            henkiloUpdateDto.setSukunimi(null);
            henkiloUpdateDto.setSukupuoli(null);
            henkiloUpdateDto.setHetu(null);
            henkiloUpdateDto.setAidinkieli(null);
            henkiloUpdateDto.setKansalaisuus(null);
            henkiloUpdateDto.setSyntymaaika(null);
        }

        henkiloUpdateSetReusableFields(henkiloUpdateDto, henkiloSaved);

        this.mapper.map(henkiloUpdateDto, henkiloSaved);
        // varmistetaan että tyhjä hetu tallentuu nullina
        if (StringUtils.isEmpty(henkiloSaved.getHetu())) {
            henkiloUpdateDto.setHetu(null);
            henkiloSaved.setHetu(null);
        }
        // This needs to be called in order to persist new yhteystiedotryhmas.
        this.henkiloDataRepository.save(henkiloSaved);
        return henkiloUpdateDto;
    }

    private void henkiloUpdateSetReusableFields(HenkiloUpdateDto henkiloUpdateDto, Henkilo henkiloSaved) {
        if (henkiloUpdateDto.getYhteystiedotRyhma() != null) {
            // poistetaan käyttäjän antamista ryhmistä read-only merkityt
            List<YhteystiedotRyhma> readOnlyRyhmat = henkiloSaved.getYhteystiedotRyhma().stream()
                    .filter(YhteystiedotRyhma::isReadOnly).collect(toList());
            henkiloUpdateDto.getYhteystiedotRyhma().removeIf(dto
                    -> readOnlyRyhmat.stream().anyMatch(entity -> entity.isEquivalentTo(dto)));
            // rakennetaan ryhmälista uudelleen
            henkiloSaved.getYhteystiedotRyhma().clear();
            // käyttäjän muokkaukset
            henkiloUpdateDto.getYhteystiedotRyhma().forEach(yhteystiedotRyhmaDto -> {
                YhteystiedotRyhma yhteystiedotRyhma = this.mapper.map(yhteystiedotRyhmaDto, YhteystiedotRyhma.class);
                yhteystiedotRyhma.setId(null);
                henkiloSaved.addYhteystiedotRyhma(yhteystiedotRyhma);
            });
            // lisätään read-only ryhmät takaisin
            henkiloSaved.getYhteystiedotRyhma().addAll(readOnlyRyhmat);

            henkiloUpdateDto.setYhteystiedotRyhma(null);
        }

        if (henkiloUpdateDto.getAidinkieli() != null && henkiloUpdateDto.getAidinkieli().getKieliKoodi() != null) {
            henkiloSaved.setAidinkieli(this.kielisyysRepository.findByKieliKoodi(henkiloUpdateDto.getAidinkieli().getKieliKoodi())
                    .orElseThrow(() -> new ValidationException("invalid.aidinkieli")));
            henkiloUpdateDto.setAidinkieli(null);
        }
        if (henkiloUpdateDto.getAsiointiKieli() != null && henkiloUpdateDto.getAsiointiKieli().getKieliKoodi() != null) {
            henkiloSaved.setAsiointiKieli(this.kielisyysRepository.findByKieliKoodi(henkiloUpdateDto.getAsiointiKieli().getKieliKoodi())
                    .orElseThrow(() -> new ValidationException("invalid.asiointikieli")));
            henkiloUpdateDto.setAsiointiKieli(null);
        }
        if (henkiloUpdateDto.getKielisyys() != null) {
            henkiloSaved.clearKielisyys();
            henkiloUpdateDto.getKielisyys().forEach(kielisyysDto -> henkiloSaved.addKielisyys(this.kielisyysRepository.findByKieliKoodi(kielisyysDto.getKieliKoodi())
                    .orElseThrow(() -> new ValidationException("invalid.kielisyys"))));
            henkiloUpdateDto.setKielisyys(null);
        }

        if (henkiloUpdateDto.getKansalaisuus() != null) {
            Set<Kansalaisuus> kansalaisuusSet = henkiloUpdateDto.getKansalaisuus().stream()
                    .map(k -> kansalaisuusRepository.findOrCreate(k.getKansalaisuusKoodi()))
                    .collect(Collectors.toCollection(HashSet::new));
            henkiloSaved.setKansalaisuus(kansalaisuusSet);
            henkiloUpdateDto.setKansalaisuus(null);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(@NotNull String henkiloOid) {
        return new HenkilonYhteystiedotViewDto(yhteystietoConverter.toHenkiloYhteystiedot(
                this.henkiloJpaRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid(henkiloOid))
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<YhteystiedotDto> getHenkiloYhteystiedot(@NotNull String henkiloOid, @NotNull String ryhma) {
        return Optional.ofNullable(yhteystietoConverter.toHenkiloYhteystiedot(
                this.henkiloJpaRepository.findYhteystiedot(new YhteystietoCriteria()
                        .withHenkiloOid(henkiloOid)
                        .withRyhma(ryhma))
        ).get(ryhma));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit) {
        List<Henkilo> hetusAndOids = this.henkiloJpaRepository.findHetusAndOids(syncedBeforeTimestamp, offset, limit);
        return mapper.mapAsList(hetusAndOids, HenkiloHetuAndOidDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier) {
        Henkilo henkilo = this.henkiloJpaRepository.findByIdentification(IdentificationDto.of(idp, identifier))
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
        return this.henkiloJpaRepository.findOidsModifiedSince(criteria, modifiedSince, offset, amount);
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(Henkilo henkiloCreate) {
        BindException errors = new BindException(henkiloCreate, "henkiloCreate");
        this.henkiloCreatePostValidator.validate(henkiloCreate, errors);
        if (errors.hasErrors()) {
            throw new UnprocessableEntityException(errors);
        }

        // varmistetaan että tyhjä hetu tallentuu nullina
        if (StringUtils.isEmpty(henkiloCreate.getHetu())) {
            henkiloCreate.setHetu(null);
        }
        henkiloCreate.setOidHenkilo(getFreePersonOid());
        henkiloCreate.setCreated(new Date());
        henkiloCreate.setModified(henkiloCreate.getCreated());
        henkiloCreate.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());

        if (henkiloCreate.getAidinkieli() != null && henkiloCreate.getAidinkieli().getKieliKoodi() != null) {
            henkiloCreate.setAidinkieli(this.kielisyysRepository.findByKieliKoodi(henkiloCreate.getAidinkieli().getKieliKoodi())
                    .orElseThrow(() -> new ValidationException("invalid.aidinkieli")));
        }
        if (henkiloCreate.getAsiointiKieli() != null && henkiloCreate.getAsiointiKieli().getKieliKoodi() != null) {
            henkiloCreate.setAsiointiKieli(this.kielisyysRepository.findByKieliKoodi(henkiloCreate.getAsiointiKieli().getKieliKoodi())
                    .orElseThrow(() -> new ValidationException("invalid.asiointikieli")));
        }
        if (henkiloCreate.getKansalaisuus() != null) {
            Set<Kansalaisuus> kansalaisuusSet = henkiloCreate.getKansalaisuus().stream()
                    .map(k -> kansalaisuusRepository.findOrCreate(k.getKansalaisuusKoodi()))
                    .collect(Collectors.toSet());
            henkiloCreate.setKansalaisuus(kansalaisuusSet);
        }

        return this.henkiloDataRepository.save(henkiloCreate);
    }

    private String getFreePersonOid() {
        final String newOid = oidGenerator.generateOID();
        if (this.getOidExists(newOid)) {
            return getFreePersonOid();
        }
        return newOid;
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloReadDto getMasterByOid(String henkiloOid) {
        Henkilo henkilo = henkiloJpaRepository
                .findMasterBySlaveOid(henkiloOid)
                .orElseGet(() -> getEntityByOid(henkiloOid));
        return mapper.map(henkilo, HenkiloReadDto.class);
    }

    private Henkilo getEntityByOid(String henkiloOid) {
        return henkiloDataRepository
                .findByOidHenkilo(henkiloOid)
                .orElseThrow(() -> new NotFoundException("Henkilöä ei löytynyt OID:lla " + henkiloOid));
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloReadDto getByHetu(String hetu) {
        Henkilo henkilo = henkiloDataRepository.findByHetu(hetu)
                .orElseThrow(() -> new NotFoundException("Henkilöä ei löytynyt henkilötunnuksella " + hetu));
        return mapper.map(henkilo, HenkiloReadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloReadDto> findSlavesByMasterOid(String masterOid) {
        List<Henkilo> henkilos = this.henkiloJpaRepository.findSlavesByMasterOid(masterOid);
        return henkilos.stream().map( h -> mapper.map(h, HenkiloReadDto.class)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloDuplicateDto> findDuplicates(String oid) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oid).orElseThrow( () -> new NotFoundException("User with oid " + oid + " was not found") );
        List<Henkilo> candidates = this.henkiloJpaRepository.findDuplicates(henkilo);
        List<HenkiloDuplicateDto> henkiloDuplicateDtos = this.mapper.mapAsList(candidates, HenkiloDuplicateDto.class);
        Set<String> duplicateOids = henkiloDuplicateDtos.stream().map(HenkiloDuplicateDto::getOidHenkilo).collect(toSet());
        Map<String, List<Map<String, Object>>> hakemukset = hakuappClient.fetchApplicationsByOid(duplicateOids);
        henkiloDuplicateDtos.forEach(h -> h.setHakemukset(hakemukset.get(h.getOidHenkilo())));
        return henkiloDuplicateDtos;
    }

    @Override
    @Transactional
    public List<String> linkHenkilos(String henkiloOid, List<String> similarHenkiloOids) {
        Date modificationDate = new Date();
        similarHenkiloOids = similarHenkiloOids.stream().filter( oid -> !henkiloOid.equals(oid)).distinct().collect(toList());

        Henkilo master = determineMasterHenkilo(henkiloOid, similarHenkiloOids);
        master.setPassivoitu(false);
        master.setDuplicate(false);
        master.setModified(modificationDate);

        List<String> slaveOids = similarHenkiloOids;
        if(!henkiloOid.equals(master.getOidHenkilo())) {
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

        for (String slaveOid : slaveOids) {
            this.linkHenkilos(modificationDate, master, viite -> master.getOidHenkilo().equals(viite.getMasterOid()), slaveOid);
        }

        return slaveOids;
    }

    private void linkHenkilos(Date modificationDate,
                              Henkilo master,
                              java.util.function.Predicate<HenkiloViite> relatesToGivenMaster,
                              String slaveOid) {
        List<HenkiloViite> existingViittees = this.henkiloViiteRepository.findBySlaveOid(slaveOid);
        existingViittees.stream().filter(relatesToGivenMaster.negate())
                .forEach(viite -> {
                    // If given slave already linked to another master, update the related (old) master
                    this.henkiloDataRepository.findByOidHenkilo(viite.getMasterOid())
                            .ifPresent( henkilo -> henkilo.setModified(modificationDate));
                    // and remove this other viite:
                    this.henkiloViiteRepository.delete(viite);
                });

        if (existingViittees.stream().anyMatch(relatesToGivenMaster)) {
            // No need to add new viite (already linked to the given master):
            return;
        }

        HenkiloViite viite = new HenkiloViite();
        viite.setMasterOid(master.getOidHenkilo());
        viite.setSlaveOid(slaveOid);
        this.henkiloViiteRepository.save(viite);

        Henkilo duplicateHenkilo = this.henkiloDataRepository.findByOidHenkilo(slaveOid)
                .orElseThrow( () -> new NotFoundException("Henkilo not found with given oid " + slaveOid) );
        duplicateHenkilo.setDuplicate(true);
        duplicateHenkilo.setPassivoitu(true);
        // Doesn't throw even if user doesn't exists in kayttooikeus-service
        this.kayttooikeusClient.passivoiHenkilo(duplicateHenkilo.getOidHenkilo(), this.userDetailsHelper.getCurrentUserOid());
        duplicateHenkilo.setModified(modificationDate);

        // Preserve two-level hierarchy, re-link slave's slaves to new master
        this.henkiloViiteRepository.findByMasterOid(slaveOid).forEach( slavesSlave -> {
            if (slavesSlave.getSlaveOid().equals(master.getOidHenkilo())) {
                this.henkiloViiteRepository.delete(slavesSlave);
            } else {
                Henkilo slaveSlaveHenkilo = this.henkiloDataRepository.findByOidHenkilo(slavesSlave.getSlaveOid())
                        .orElseThrow( () -> new NotFoundException("Henkilo not found with given oid " + slavesSlave.getSlaveOid()));
                slaveSlaveHenkilo.setModified(modificationDate);
                slavesSlave.setMasterOid(master.getOidHenkilo());
            }
        });
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
        if(hasMoreThanOneIdentifiedHenkilo(allHenkilos)) {
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
        return henkilo.isYksiloity() || henkilo.isYksiloityVTJ();
    }

    @Override
    @Transactional
    public void unlinkHenkilo(String oid, String slaveOid) {
        Date modificationDate = new Date();
        Henkilo slave = this.henkiloDataRepository.findByOidHenkilo(slaveOid)
                .orElseThrow( () -> new NotFoundException("User with oid " + oid + " was not found"));
        slave.setDuplicate(false);
        slave.setPassivoitu(false);
        slave.setModified(modificationDate);
        this.henkiloViiteRepository.removeByMasterOidAndSlaveOid(oid, slaveOid);
    }

    @Override
    @Transactional(readOnly = true)
    public String getAsiointikieli(String oidHenkilo) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oidHenkilo)
                .orElseThrow(() -> new NotFoundException("Henkilo not found with oid " + oidHenkilo));
        return UserDetailsHelperImpl.getAsiointikieliOrDefault(henkilo);
    }

}
