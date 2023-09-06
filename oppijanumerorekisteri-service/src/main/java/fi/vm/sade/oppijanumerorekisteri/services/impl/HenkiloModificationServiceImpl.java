package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.aspects.AuditlogAspectHelper;
import fi.vm.sade.oppijanumerorekisteri.clients.HenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysPalvelu;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.utils.YhteystietoryhmaUtils;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HuoltajaCreatePostValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper.created;
import static fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper.found;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
@Slf4j
public class HenkiloModificationServiceImpl implements HenkiloModificationService {

    private final HenkiloUpdatePostValidator henkiloUpdatePostValidator;
    private final HenkiloCreatePostValidator henkiloCreatePostValidator;
    private final HuoltajaCreatePostValidator huoltajaCreatePostValidator;

    private final HenkiloRepository henkiloDataRepository;
    private final KielisyysRepository kielisyysRepository;
    private final KansalaisuusRepository kansalaisuusRepository;
    private final YksilointitietoRepository yksilointitietoRepository;
    private final AsiayhteysPalveluRepository asiayhteysPalveluRepository;

    private final KayttooikeusClient kayttooikeusClient;

    private final PermissionChecker permissionChecker;
    private final HenkiloService henkiloService;
    private final DuplicateService duplicateService;

    private final HenkiloModifiedTopic henkiloModifiedTopic;

    private final OrikaConfiguration mapper;
    private final UserDetailsHelper userDetailsHelper;
    private final OidGenerator oidGenerator;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;
    private final AuditlogAspectHelper auditlogAspectHelper;

    // Mapper is configured to ignore null values so setting henkiloUpdateDto field
    // to null is same as skipping the field.
    // If one wishes to enable validation groups with hibernate one needs to disable
    // automatic validation and manually
    // call the validator.
    @Override
    @Transactional
    public HenkiloUpdateDto updateHenkilo(HenkiloUpdateDto henkiloUpdateDto) {
        Henkilo henkiloSaved = this.henkiloDataRepository.findByOidHenkiloIsIn(
                Lists.newArrayList(henkiloUpdateDto.getOidHenkilo()))
                .stream().findFirst().orElseThrow(NotFoundException::new);

        if (henkiloUpdateDto.getEtunimet() != null || henkiloUpdateDto.getKutsumanimi() != null) {
            // etunimet ja/tai kutsumanimi muuttuu -> asetetaan molemmat jotta voidaan tehdä
            // validointi
            henkiloUpdateDto.setEtunimet(
                    Optional.ofNullable(henkiloUpdateDto.getEtunimet()).orElse(henkiloSaved.getEtunimet()));
            henkiloUpdateDto.setKutsumanimi(
                    Optional.ofNullable(henkiloUpdateDto.getKutsumanimi()).orElse(henkiloSaved.getKutsumanimi()));
        }

        BindException errors = new BindException(henkiloUpdateDto, "henkiloUpdateDto");
        this.henkiloUpdatePostValidator.validate(henkiloUpdateDto, errors);
        if (errors.hasErrors()) {
            throw new UnprocessableEntityException(errors);
        }

        if (henkiloSaved.isPassivoitu() && Boolean.FALSE.equals(henkiloUpdateDto.getPassivoitu())) {
            if (!permissionChecker.isSuperUser()) {
                throw new ForbiddenException("Vain rekisterinpitäjä voi aktivoida henkilön");
            }
        }

        // Do not update all values if henkilo is already vtj yksiloity
        if (henkiloSaved.isYksiloityVTJ()) {
            henkiloUpdateDto.setEtunimet(null);
            henkiloUpdateDto.setSukunimi(null);
            henkiloUpdateDto.setSukupuoli(null);
            henkiloUpdateDto.setHetu(null);
            henkiloUpdateDto.setAidinkieli(null);
            henkiloUpdateDto.setKansalaisuus(null);
            henkiloUpdateDto.setSyntymaaika(null);
            henkiloUpdateDto.setKotikunta(null);
        }

        // In case hetu changes henkilo should be considered pristine from
        // identification point of view
        if (henkiloUpdateDto.getHetu() != null && !Objects.equals(henkiloSaved.getHetu(), henkiloUpdateDto.getHetu())) {
            yksilointitietoRepository.findByHenkilo(henkiloSaved).ifPresent(yksilointitietoRepository::delete);
            henkiloSaved.getYksilointivirheet().clear();
            henkiloSaved.setYksilointiYritetty(false);
        }

        this.henkiloUpdateSetReusableFields(henkiloUpdateDto, henkiloSaved, false);

        this.mapper.map(henkiloUpdateDto, henkiloSaved);
        // varmistetaan että tyhjä hetu tallentuu nullina
        if (!StringUtils.hasLength(henkiloSaved.getHetu())) {
            henkiloUpdateDto.setHetu(null);
            henkiloSaved.setHetu(null);
        }
        update(henkiloSaved);
        return henkiloUpdateDto;
    }

    // Mapper is configured to ignore null values so setting henkiloUpdateDto field
    // to null is same as skipping the field.
    // If one wishes to enable validation groups with hibernate one needs to disable
    // automatic validation and manually
    // call the validator.
    //
    // Same as updateHenkilo, only with fewer validations.
    // Values can be saved overwritten and Hetu can be changed even if
    // isYksiloityVTJ() is true.
    @Override
    @Transactional
    public HenkiloForceReadDto forceUpdateHenkilo(HenkiloForceUpdateDto henkiloUpdateDto) {
        return forceUpdateHenkiloInternal(henkiloUpdateDto, false);
    }

    private HenkiloForceReadDto forceUpdateHenkiloInternal(HenkiloForceUpdateDto henkiloUpdateDto,
            boolean skipNameValidation) {
        log.info("Updating henkilo with oid {}", henkiloUpdateDto.getOidHenkilo());
        final Henkilo henkiloSaved = this.henkiloDataRepository.findByOidHenkilo(henkiloUpdateDto.getOidHenkilo())
                .orElseThrow(() -> new NotFoundException("Could not find henkilo " + henkiloUpdateDto.getOidHenkilo()));

        Set<String> kaikkiHetut = combineKaikkiHetut(henkiloUpdateDto, henkiloSaved);
        List<Henkilo> henkilot = kaikkiHetut.stream()
                .flatMap(hetu -> henkiloDataRepository.findByKaikkiHetut(hetu).stream())
                .collect(toList());
        if (!henkilot.isEmpty()) {
            Comparator<Henkilo> originalHenkiloSortOrder = Comparator.comparing(Henkilo::getCreated)
                    .thenComparing(Henkilo::getId);
            Henkilo originalHenkilo = henkilot.stream().min(originalHenkiloSortOrder)
                    .orElseThrow(() -> new IllegalStateException(
                            "Expected to find at least one henkilo to update with hetus"));

            log.info("Found {} henkilos ({}) with given hetus and of those {} is the oldest",
                    henkilot.size(),
                    henkilot.stream().map(Henkilo::getOidHenkilo).collect(Collectors.joining(", ")),
                    originalHenkilo.getOidHenkilo());
            if (!originalHenkilo.getOidHenkilo().equals(henkiloUpdateDto.getOidHenkilo())) {
                log.info("Trying to update duplicate henkilo; updating the original instead");
                henkiloUpdateDto.setOidHenkilo(originalHenkilo.getOidHenkilo());
                return forceUpdateHenkiloInternal(henkiloUpdateDto, true);
            }
        }

        if (!skipNameValidation
                && (henkiloUpdateDto.getEtunimet() != null || henkiloUpdateDto.getKutsumanimi() != null)) {
            // etunimet ja/tai kutsumanimi muuttuu -> asetetaan molemmat jotta voidaan tehdä
            // validointi
            henkiloUpdateDto.setEtunimet(
                    Optional.ofNullable(henkiloUpdateDto.getEtunimet()).orElse(henkiloSaved.getEtunimet()));
            henkiloUpdateDto.setKutsumanimi(
                    Optional.ofNullable(henkiloUpdateDto.getKutsumanimi()).orElse(henkiloSaved.getKutsumanimi()));
        }

        BindException errors = new BindException(henkiloUpdateDto, "henkiloForceUpdateDto");
        this.henkiloUpdatePostValidator.validateWithoutHetu(henkiloUpdateDto, errors);
        if (!errors.hasErrors() && henkiloUpdateDto.getHuoltajat() != null) {
            // These can't be validated in henkiloUpdatePostValidator because different
            // errors type
            for (HuoltajaCreateDto huoltajaCreateDto : henkiloUpdateDto.getHuoltajat()) {
                errors = new BindException(huoltajaCreateDto, "huoltajaCreateDto");
                this.huoltajaCreatePostValidator.validate(huoltajaCreateDto, errors);
            }
        }
        if (errors.hasErrors()) {
            log.info("Henkilo update from henkilotietomuutos contianed errors");
            throw new UnprocessableEntityException(errors);
        }

        DuplicateService.LinkResult linked = this.updateHetuAndLinkDuplicate(henkiloUpdateDto, henkiloSaved);

        henkiloUpdateSetReusableFields(henkiloUpdateDto, henkiloSaved, true);

        Optional.ofNullable(henkiloUpdateDto.getHuoltajat())
                .map(huoltajaCreateDtos -> huoltajaCreateDtos.stream()
                        .map(huoltajaCreateDto -> HenkiloHuoltajaSuhde.builder()
                                .lapsi(henkiloSaved)
                                .huoltaja(this.findOrCreateHuoltaja(huoltajaCreateDto, henkiloSaved))
                                .alkuPvm(huoltajaCreateDto.getHuoltajuusAlku())
                                .loppuPvm(huoltajaCreateDto.getHuoltajuusLoppu())
                                .build())
                        .collect(Collectors.toSet()))
                .ifPresent(henkiloSaved::setHuoltajat);
        henkiloUpdateDto.setHuoltajat(null);

        this.mapper.map(henkiloUpdateDto, henkiloSaved);

        linked.forEachModified(this::update);
        return mapper.map(henkiloSaved, HenkiloForceReadDto.class);
    }

    private static Set<String> combineKaikkiHetut(HenkiloForceUpdateDto henkiloUpdateDto, Henkilo henkiloSaved) {
        Set<String> kaikkiHetut = new HashSet<>();
        if (henkiloSaved.getHetu() != null)
            kaikkiHetut.add(henkiloSaved.getHetu());
        if (henkiloUpdateDto.getHetu() != null)
            kaikkiHetut.add(henkiloUpdateDto.getHetu());
        if (henkiloUpdateDto.getKaikkiHetut() != null)
            kaikkiHetut.addAll(henkiloUpdateDto.getKaikkiHetut());
        if (henkiloSaved.getKaikkiHetut() != null)
            kaikkiHetut.addAll(henkiloSaved.getKaikkiHetut());
        return kaikkiHetut;
    }

    @Transactional
    @Override
    public Henkilo findOrCreateHuoltaja(HuoltajaCreateDto huoltajaCreateDto, Henkilo lapsi) {
        Optional<Henkilo> huoltaja = Optional.empty();
        if (StringUtils.hasLength(huoltajaCreateDto.getHetu())) {
            huoltaja = henkiloDataRepository.findByHetu(huoltajaCreateDto.getHetu())
                    .or(() -> this.henkiloDataRepository.findByKaikkiHetut(huoltajaCreateDto.getHetu()));
            // Ainoastaan etukäteen kutsujan "yksilöimä" huoltaja
            huoltaja.filter(henkilo -> Boolean.TRUE.equals(huoltajaCreateDto.getYksiloityVTJ()))
                    .ifPresent(henkilo -> this.mapper.map(huoltajaCreateDto, henkilo));
        } else if (StringUtils.hasLength(huoltajaCreateDto.getEtunimet())
                && StringUtils.hasLength(huoltajaCreateDto.getSukunimi())) {
            huoltaja = lapsi.getHuoltajat().stream()
                    .map(HenkiloHuoltajaSuhde::getHuoltaja)
                    .filter(existingHuoltaja -> huoltajaCreateDto.getEtunimet().equals(existingHuoltaja.getEtunimet()))
                    .filter(existingHuoltaja -> huoltajaCreateDto.getSukunimi().equals(existingHuoltaja.getSukunimi()))
                    .map(existingHuoltaja -> {
                        this.mapper.map(huoltajaCreateDto, existingHuoltaja);
                        return existingHuoltaja;
                    })
                    .map(this.henkiloDataRepository::save)
                    .findFirst();
        }
        huoltaja.ifPresent(this::update);
        return huoltaja.orElseGet(
                () -> this.createHenkilo(huoltajaCreateDto, oppijanumerorekisteriProperties.getRootUserOid()));
    }

    private DuplicateService.LinkResult updateHetuAndLinkDuplicate(HenkiloForceUpdateDto henkiloUpdateDto,
            Henkilo henkiloSaved) {
        // Only if hetu has changed
        if (StringUtils.hasLength(henkiloUpdateDto.getHetu())
                && !henkiloUpdateDto.getHetu().equals(henkiloSaved.getHetu())) {
            log.info("Hetu has changed for henkilo {}", henkiloUpdateDto.getOidHenkilo());
            if (henkiloSaved.isYksiloityVTJ()) {
                henkiloDataRepository.findByHetu(henkiloUpdateDto.getHetu()).ifPresent(henkiloByUusiHetu -> {
                    henkiloByUusiHetu.clearHetut();
                    henkiloDataRepository.saveAndFlush(henkiloByUusiHetu);
                });
                henkiloSaved.addHetu(henkiloUpdateDto.getHetu());
            }
            String newHetu = henkiloUpdateDto.getHetu();
            DuplicateService.LinkResult linked = this.duplicateService.removeDuplicateHetuAndLink(henkiloSaved,
                    newHetu);
            henkiloSaved.setHetu(newHetu);
            henkiloUpdateDto.setHetu(null);
            return linked;
        } else {
            return new DuplicateService.LinkResult(henkiloSaved, Collections.singletonList(henkiloSaved),
                    Collections.emptyList());
        }
    }

    private void henkiloUpdateSetReusableFields(HenkiloUpdateDto henkiloUpdateDto, Henkilo henkiloSaved,
            boolean overwriteReadOnly) {
        YhteystietoryhmaUtils.updateYhteystiedot(henkiloUpdateDto.getYhteystiedotRyhma(),
                henkiloSaved.getYhteystiedotRyhma(), overwriteReadOnly, this.mapper);
        henkiloUpdateDto.setYhteystiedotRyhma(null);

        if (henkiloUpdateDto.getAidinkieli() != null && henkiloUpdateDto.getAidinkieli().getKieliKoodi() != null) {
            henkiloSaved.setAidinkieli(
                    this.kielisyysRepository.findOrCreateByKoodi(henkiloUpdateDto.getAidinkieli().getKieliKoodi()));
            henkiloUpdateDto.setAidinkieli(null);
        }
        if (henkiloUpdateDto.getAsiointiKieli() != null
                && henkiloUpdateDto.getAsiointiKieli().getKieliKoodi() != null) {
            henkiloSaved.setAsiointiKieli(
                    this.kielisyysRepository.findOrCreateByKoodi(henkiloUpdateDto.getAsiointiKieli().getKieliKoodi()));
            henkiloUpdateDto.setAsiointiKieli(null);
        }

        if (henkiloUpdateDto.getKansalaisuus() != null) {
            Set<Kansalaisuus> kansalaisuusSet = henkiloUpdateDto.getKansalaisuus().stream()
                    .map(k -> kansalaisuusRepository.findOrCreate(k.getKansalaisuusKoodi()))
                    .collect(Collectors.toCollection(HashSet::new));
            henkiloSaved.setKansalaisuus(kansalaisuusSet);
            henkiloUpdateDto.setKansalaisuus(null);
        }
    }

    @Transactional
    @Override
    public Henkilo update(Henkilo henkilo) {
        setSyntymaaikaAndSukupuoliFromHetu(henkilo);

        // varmistetaan että tyhjä hetu tallentuu nullina
        if (!StringUtils.hasLength(henkilo.getHetu())) {
            henkilo.setHetu(null);
        }

        Date nyt = new Date();
        Optional<String> kayttajaOid = userDetailsHelper.findCurrentUserOid();

        henkilo.setModified(nyt);
        // jos käyttäjää ei ole tiedossa (esim. yksilöinnin tausta-ajo),
        // pidetään käsittelijä ennallaan
        kayttajaOid.ifPresent(henkilo::setKasittelijaOid);
        Henkilo tallennettu = henkiloDataRepository.save(henkilo);

        // päivitettäessä henkilöä, päivitetään samalla kaikkien slave-henkilöiden
        // modified-aikaleima, jotta myös slavet näkyvät muutosrajapinnassa
        log.info("Marking all duplicates as updated");
        List<Henkilo> duplikaatit = henkiloDataRepository.findSlavesByMasterOid(tallennettu.getOidHenkilo()).stream()
                .map(slave -> {
                    slave.setModified(nyt);
                    kayttajaOid.ifPresent(slave::setKasittelijaOid);
                    return henkiloDataRepository.save(slave);
                    // rakenne ei ole rekursiivinen (vaikka kantarakenne mahdollistaakin)
                    // joten päivitystä ei tarvitse tehdä rekursiivisesti
                }).collect(toList());

        henkiloModifiedTopic.publish(tallennettu);
        duplikaatit.forEach(henkiloModifiedTopic::publish);

        return tallennettu;
    }

    @Override
    @Transactional
    public Henkilo disableHenkilo(String oid) {
        Henkilo henkilo = this.henkiloDataRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("Henkilö not found"));
        henkilo.setPassivoitu(true);
        String kasittelija = SecurityContextHolder.getContext().getAuthentication().getName();

        this.kayttooikeusClient.passivoiHenkilo(oid, kasittelija);
        return henkilo;
    }

    @Override
    public void removeAccessRights(String oid) {
        String kasittelija = SecurityContextHolder.getContext().getAuthentication().getName();
        kayttooikeusClient.passivoiHenkilo(oid, kasittelija);
        henkiloService.removeContactInfo(oid, YhteystietoryhmaUtils.TYYPPI_TYOOSOITE);
    }

    @Override
    @Transactional
    public FindOrCreateWrapper<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(
            HenkiloPerustietoDto henkiloPerustietoDto) {
        return findHenkilo(henkiloPerustietoDto)
                .map(entity -> found(this.mapper.map(entity, HenkiloPerustietoDto.class)))
                .orElseGet(() -> created(this.createHenkilo(henkiloPerustietoDto)));
    }

    private Optional<Henkilo> findHenkilo(HenkiloPerustietoDto henkiloPerustietoDto) {
        return Stream.<Function<HenkiloPerustietoDto, Optional<Henkilo>>>of(
                dto -> Optional.ofNullable(dto.getOidHenkilo())
                        .flatMap(oid -> Optional.of(this.henkiloService.getEntityByOid(oid))),
                dto -> Optional.ofNullable(dto.getExternalIds())
                        .filter(externalIds -> !externalIds.isEmpty())
                        .flatMap(externalIds -> findUnique(henkiloDataRepository.findByExternalIds(externalIds))),
                dto -> Optional.ofNullable(dto.getIdentifications())
                        .filter(identifications -> !identifications.isEmpty())
                        .flatMap(identifications -> findUnique(
                                henkiloDataRepository.findByIdentifications(identifications))),
                dto -> Optional.ofNullable(dto.getHetu())
                        .flatMap(hetu -> henkiloDataRepository.findByHetu(hetu)
                                .or(() -> henkiloDataRepository.findByKaikkiHetut(hetu))))
                .map(transformer -> transformer.apply(henkiloPerustietoDto))
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
        if (dto.getPalveluasiayhteys() != null) {
            AsiayhteysPalvelu asiayhteys = new AsiayhteysPalvelu(entity, dto.getPalveluasiayhteys(), new Date());
            asiayhteysPalveluRepository.save(asiayhteys);
        }
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
    public Henkilo createAndYksiloiHenkilo(HenkiloCreateDto henkiloDto) {
        Henkilo henkilo = this.mapper.map(henkiloDto, Henkilo.class);
        Henkilo created = this.createHenkilo(henkilo);
        if (isHenkiloValidForHetuttomanYksilointi(created)) {
            HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(created.getEtunimet(),
                created.getKutsumanimi(), created.getSukunimi(), created.getSyntymaaika());
            int duplikaatit = this.henkiloDataRepository.findDuplikaatitCount(criteria, created.getOidHenkilo());
            if (duplikaatit < 1) {
                created.setYksiloity(true);
                this.henkiloDataRepository.save(created);
            }
        }
        return created;
    }

    @Override
    public boolean isHenkiloValidForHetuttomanYksilointi(Henkilo henkilo) {
        return henkilo.getHetu() == null
            && henkilo.isYksiloityVTJ() == false
            && henkilo.isYksiloity() == false
            && henkilo.isDuplicate() == false
            && StringUtils.hasLength(henkilo.getEtunimet())
            && StringUtils.hasLength(henkilo.getSukunimi())
            && StringUtils.hasLength(henkilo.getKutsumanimi())
            && StringUtils.hasLength(henkilo.getSukupuoli())
            && henkilo.getSyntymaaika() != null
            && henkilo.getAidinkieli() != null
            && henkilo.getKansalaisuus() != null && henkilo.getKansalaisuus().size() > 0;
    }

    @Override
    @Transactional
    public HenkiloDto createHenkilo(HenkiloCreateDto henkiloDto) {
        Henkilo henkilo = this.mapper.map(henkiloDto, Henkilo.class);
        return this.mapper.map(this.createHenkilo(henkilo), HenkiloDto.class);
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(HuoltajaCreateDto huoltajaCreateDto, String kasittelijaOid) {
        BindException errors = new BindException(huoltajaCreateDto, "huoltajaCreateDto");
        this.huoltajaCreatePostValidator.validate(huoltajaCreateDto, errors);
        if (errors.hasErrors()) {
            throw new UnprocessableEntityException(errors);
        }
        Henkilo henkilo = this.mapper.map(huoltajaCreateDto, Henkilo.class);
        return this.createHenkilo(henkilo, kasittelijaOid, !StringUtils.hasLength(henkilo.getHetu()));
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(HuoltajaCreateDto huoltajaCreateDto) {
        return createHenkilo(huoltajaCreateDto, userDetailsHelper.getCurrentUserOid());
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(Henkilo henkiloCreate) {
        return createHenkilo(henkiloCreate, userDetailsHelper.getCurrentUserOid(), true);
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(Henkilo henkiloCreate, String kasittelijaOid, boolean validate) {
        if (validate) {
            BindException errors = new BindException(henkiloCreate, "henkiloCreate");
            this.henkiloCreatePostValidator.validate(henkiloCreate, errors);
            if (errors.hasErrors()) {
                throw new UnprocessableEntityException(errors);
            }
        }

        // varmistetaan että tyhjä hetu tallentuu nullina
        if (!StringUtils.hasLength(henkiloCreate.getHetu())) {
            henkiloCreate.setHetu(null);
        }
        setSyntymaaikaAndSukupuoliFromHetu(henkiloCreate);
        henkiloCreate.setOidHenkilo(getFreePersonOid());
        henkiloCreate.setCreated(new Date());
        henkiloCreate.setModified(henkiloCreate.getCreated());
        henkiloCreate.setKasittelijaOid(kasittelijaOid);

        if (henkiloCreate.isYksiloity()) {
            // yksilöidään hetuton luonnin yhteydessä
            if (henkiloCreate.getHetu() != null) {
                throw new ValidationException("Henkilöllä on hetu, yksilöintiä ei voida tehdä");
            }
            if (henkiloCreate.isDuplicate()) {
                throw new ValidationException("Henkilö on duplikaatti, yksilöintiä ei voida tehdä");
            }
        }

        // hylätään tyhjät passinumerot
        if (henkiloCreate.getPassinumerot() != null) {
            Set<String> passinumerot = henkiloCreate.getPassinumerot().stream()
                    .filter(passinumero -> passinumero != null && !passinumero.trim().isEmpty())
                    .collect(toSet());
            henkiloCreate.setPassinumerot(passinumerot);
        }

        if (henkiloCreate.getAidinkieli() != null && henkiloCreate.getAidinkieli().getKieliKoodi() != null) {
            henkiloCreate.setAidinkieli(
                    this.kielisyysRepository.findOrCreateByKoodi(henkiloCreate.getAidinkieli().getKieliKoodi()));
        }
        if (henkiloCreate.getAsiointiKieli() != null && henkiloCreate.getAsiointiKieli().getKieliKoodi() != null) {
            henkiloCreate.setAsiointiKieli(
                    this.kielisyysRepository.findOrCreateByKoodi(henkiloCreate.getAsiointiKieli().getKieliKoodi()));
        }
        if (henkiloCreate.getKansalaisuus() != null) {
            Set<Kansalaisuus> kansalaisuusSet = henkiloCreate.getKansalaisuus().stream()
                    .map(k -> kansalaisuusRepository.findOrCreate(k.getKansalaisuusKoodi()))
                    .collect(Collectors.toSet());
            henkiloCreate.setKansalaisuus(kansalaisuusSet);
        }

        Henkilo tallennettu = this.henkiloDataRepository.save(henkiloCreate);
        henkiloModifiedTopic.publish(tallennettu);
        auditlogAspectHelper.logCreateHenkilo(tallennettu, null);
        return tallennettu;
    }

    @Override
    @Transactional
    public List<String> linkHenkilos(String henkiloOid, List<String> similarHenkiloOids) {
        DuplicateService.LinkResult linked = this.duplicateService.linkHenkilos(henkiloOid, similarHenkiloOids);
        linked.forEachModified(this::update);
        return linked.getSlaveOids();
    }

    @Override
    @Transactional
    public void unlinkHenkilo(String oid, String slaveOid) {
        this.duplicateService.unlinkHenkilo(oid, slaveOid).forEachModified(this::update);
    }

    @Override
    @Transactional
    public List<String> forceLinkHenkilos(String master, List<String> duplicates) {
        List<Henkilo> candidates = henkiloDataRepository.findByOidHenkiloIsIn(duplicates);
        validateForceLinkCandidates(candidates);
        puraYksiloinnit(candidates);
        return linkHenkilos(master, duplicates);
    }

    private void validateForceLinkCandidates(List<Henkilo> candidates) {
        candidates.stream().filter(henkilo -> henkilo.isYksiloityVTJ() || henkilo.getHetu() != null).findAny()
                .ifPresent(henkilo -> {
                    throw new ValidationException();
                });
    }

    private void puraYksiloinnit(List<Henkilo> candidates) {
        candidates.stream()
                .filter(Henkilo::isYksiloity)
                .forEach(henkilo -> henkilo.setYksiloity(false));
    }

    private String getFreePersonOid() {
        final String newOid = oidGenerator.generateOID();
        if (this.henkiloService.getOidExists(newOid)) {
            return getFreePersonOid();
        }
        return newOid;
    }

    private static void setSyntymaaikaAndSukupuoliFromHetu(Henkilo henkilo) {
        if (HetuUtils.hetuIsValid(henkilo.getHetu())) {
            henkilo.setSyntymaaika(HetuUtils.dateFromHetu(henkilo.getHetu()));
            henkilo.setSukupuoli(HetuUtils.sukupuoliFromHetu(henkilo.getHetu()));
        }
    }
}
