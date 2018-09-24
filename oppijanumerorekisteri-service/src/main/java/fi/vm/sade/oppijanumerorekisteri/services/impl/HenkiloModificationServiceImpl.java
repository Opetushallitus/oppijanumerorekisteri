package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysPalveluRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HuoltajaCreatePostValidator;
import lombok.RequiredArgsConstructor;
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
import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysPalvelu;


import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
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

    private final OrikaConfiguration mapper;
    private final UserDetailsHelper userDetailsHelper;
    private final OidGenerator oidGenerator;

    // Mapper is configured to ignore null values so setting henkiloUpdateDto field to null is same as skipping the field.
    // If one wishes to enable validation groups with hibernate one needs to disable automatic validation and manually
    // call the validator.
    @Override
    @Transactional
    public HenkiloUpdateDto updateHenkilo(HenkiloUpdateDto henkiloUpdateDto) {
        Henkilo henkiloSaved = this.henkiloDataRepository.findByOidHenkiloIsIn(
                Lists.newArrayList(henkiloUpdateDto.getOidHenkilo()))
                .stream().findFirst().orElseThrow(NotFoundException::new);

        if (henkiloUpdateDto.getEtunimet() != null || henkiloUpdateDto.getKutsumanimi() != null) {
            // etunimet ja/tai kutsumanimi muuttuu -> asetetaan molemmat jotta voidaan tehdä validointi
            henkiloUpdateDto.setEtunimet(Optional.ofNullable(henkiloUpdateDto.getEtunimet()).orElse(henkiloSaved.getEtunimet()));
            henkiloUpdateDto.setKutsumanimi(Optional.ofNullable(henkiloUpdateDto.getKutsumanimi()).orElse(henkiloSaved.getKutsumanimi()));
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

        if (!StringUtils.isEmpty(henkiloUpdateDto.getHetu()) && HetuUtils.hetuIsValid(henkiloUpdateDto.getHetu())) {
            henkiloUpdateDto.setSyntymaaika(HetuUtils.dateFromHetu(henkiloUpdateDto.getHetu()));
            henkiloUpdateDto.setSukupuoli(HetuUtils.sukupuoliFromHetu(henkiloUpdateDto.getHetu()));
        }
        // In case hetu changes henkilo should be considered pristine from identification point of view
        if (henkiloUpdateDto.getHetu() != null && !Objects.equals(henkiloSaved.getHetu(), henkiloUpdateDto.getHetu())) {
            yksilointitietoRepository.findByHenkilo(henkiloSaved).ifPresent(yksilointitietoRepository::delete);
            henkiloSaved.getYksilointivirheet().clear();
            henkiloSaved.setYksilointiYritetty(false);
        }

        this.henkiloUpdateSetReusableFields(henkiloUpdateDto, henkiloSaved, false);

        this.mapper.map(henkiloUpdateDto, henkiloSaved);
        // varmistetaan että tyhjä hetu tallentuu nullina
        if (StringUtils.isEmpty(henkiloSaved.getHetu())) {
            henkiloUpdateDto.setHetu(null);
            henkiloSaved.setHetu(null);
        }
        update(henkiloSaved);
        return henkiloUpdateDto;
    }

    // Mapper is configured to ignore null values so setting henkiloUpdateDto field to null is same as skipping the field.
    // If one wishes to enable validation groups with hibernate one needs to disable automatic validation and manually
    // call the validator.
    //
    // Same as updateHenkilo, only with fewer validations.
    // Values can be saved overwritten and Hetu can be changed even if isYksiloityVTJ() is true.
    @Override
    @Transactional
    public HenkiloReadDto forceUpdateHenkilo(HenkiloForceUpdateDto henkiloUpdateDto) {
        final Henkilo henkiloSaved = this.henkiloDataRepository.findByOidHenkilo(henkiloUpdateDto.getOidHenkilo())
                .orElseThrow(() -> new NotFoundException("Could not find henkilo " + henkiloUpdateDto.getOidHenkilo()));

        if (henkiloUpdateDto.getEtunimet() != null || henkiloUpdateDto.getKutsumanimi() != null) {
            // etunimet ja/tai kutsumanimi muuttuu -> asetetaan molemmat jotta voidaan tehdä validointi
            henkiloUpdateDto.setEtunimet(Optional.ofNullable(henkiloUpdateDto.getEtunimet()).orElse(henkiloSaved.getEtunimet()));
            henkiloUpdateDto.setKutsumanimi(Optional.ofNullable(henkiloUpdateDto.getKutsumanimi()).orElse(henkiloSaved.getKutsumanimi()));
        }

        BindException errors = new BindException(henkiloUpdateDto, "henkiloForceUpdateDto");
        this.henkiloUpdatePostValidator.validateWithoutHetu(henkiloUpdateDto, errors);
        if (!errors.hasErrors() && henkiloUpdateDto.getHuoltajat() != null) {
            // These can't be validated in henkiloUpdatePostValidator because different errors type
            for (HuoltajaCreateDto huoltajaCreateDto : henkiloUpdateDto.getHuoltajat()) {
                errors = new BindException(huoltajaCreateDto, "huoltajaCreateDto");
                this.huoltajaCreatePostValidator.validate(huoltajaCreateDto, errors);
            }
        }
        if (errors.hasErrors()) {
            throw new UnprocessableEntityException(errors);
        }


        this.updateHetuAndLinkDuplicate(henkiloUpdateDto, henkiloSaved);

        henkiloUpdateSetReusableFields(henkiloUpdateDto, henkiloSaved, true);

        Optional.ofNullable(henkiloUpdateDto.getHuoltajat())
                .map(huoltajaCreateDtos -> huoltajaCreateDtos.stream()
                        .map(huoltajaCreateDto -> HenkiloHuoltajaSuhde.builder()
                                .lapsi(henkiloSaved)
                                .huoltaja(this.findOrCreateHuoltaja(huoltajaCreateDto, henkiloSaved))
                                .huoltajuustyyppiKoodi(huoltajaCreateDto.getHuoltajuustyyppiKoodi())
                                .build())
                        .collect(Collectors.toSet()))
                .ifPresent(henkiloSaved::setHuoltajat);
        henkiloUpdateDto.setHuoltajat(null);

        this.mapper.map(henkiloUpdateDto, henkiloSaved);

        return mapper.map(this.update(henkiloSaved), HenkiloReadDto.class);
    }

    private Henkilo findOrCreateHuoltaja(HuoltajaCreateDto huoltajaCreateDto, Henkilo lapsi) {
        Optional<Henkilo> huoltaja = Optional.empty();
        if (StringUtils.hasLength(huoltajaCreateDto.getHetu())) {
            huoltaja = this.henkiloDataRepository.findByHetu(huoltajaCreateDto.getHetu());
        }
        else if (StringUtils.hasLength(huoltajaCreateDto.getEtunimet()) && StringUtils.hasLength(huoltajaCreateDto.getSukunimi())) {
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
        return huoltaja.orElseGet(() -> this.createHenkilo(huoltajaCreateDto));
    }

    private void updateHetuAndLinkDuplicate(HenkiloForceUpdateDto henkiloUpdateDto, Henkilo henkiloSaved) {
        // Only if hetu has changed
        if (StringUtils.hasLength(henkiloUpdateDto.getHetu()) && !henkiloUpdateDto.getHetu().equals(henkiloSaved.getHetu())) {
            String newHetu = henkiloUpdateDto.getHetu();
            this.duplicateService.removeDuplicateHetuAndLink(henkiloUpdateDto.getOidHenkilo(), newHetu);
            henkiloSaved.setHetu(newHetu);
            henkiloUpdateDto.setHetu(null);
        }
    }

    private void henkiloUpdateSetReusableFields(HenkiloUpdateDto henkiloUpdateDto, Henkilo henkiloSaved, boolean overwriteReadOnly) {
        if (henkiloUpdateDto.getYhteystiedotRyhma() != null) {
            final Collection<YhteystiedotRyhma> readOnlyRyhmat;
            if (!overwriteReadOnly) {
                // poistetaan käyttäjän antamista ryhmistä read-only merkityt
                readOnlyRyhmat = henkiloSaved.getYhteystiedotRyhma().stream()
                        .filter(YhteystiedotRyhma::isReadOnly).collect(toList());
                henkiloUpdateDto.getYhteystiedotRyhma().removeIf(dto
                        -> readOnlyRyhmat.stream().anyMatch(entity -> entity.isEquivalentTo(dto)));
            } else {
                readOnlyRyhmat = Collections.emptyList();
            }
            // rakennetaan ryhmälista uudelleen
            henkiloSaved.getYhteystiedotRyhma().clear();
            henkiloSaved.getYhteystiedotRyhma().addAll(Stream.concat(
                    // käyttäjän muokkaukset
                    henkiloUpdateDto.getYhteystiedotRyhma().stream().map(yhteystiedotRyhmaDto -> {
                        YhteystiedotRyhma yhteystiedotRyhma = this.mapper.map(yhteystiedotRyhmaDto, YhteystiedotRyhma.class);
                        yhteystiedotRyhma.setId(null);
                        return yhteystiedotRyhma;
                    }), readOnlyRyhmat.stream()) // lisätään read-only ryhmät takaisin
                    .filter(YhteystiedotRyhma::isNotEmpty) // poistetaan tyhjät yhteystietoryhmät (myös read-only)
                    .collect(toSet()));

            henkiloUpdateDto.setYhteystiedotRyhma(null);
        }

        if (henkiloUpdateDto.getAidinkieli() != null && henkiloUpdateDto.getAidinkieli().getKieliKoodi() != null) {
            henkiloSaved.setAidinkieli(this.kielisyysRepository.findOrCreateByKoodi(henkiloUpdateDto.getAidinkieli().getKieliKoodi()));
            henkiloUpdateDto.setAidinkieli(null);
        }
        if (henkiloUpdateDto.getAsiointiKieli() != null && henkiloUpdateDto.getAsiointiKieli().getKieliKoodi() != null) {
            // Request ldap sync only if asiointikieli not set or changes.
            if (henkiloSaved.getAsiointiKieli() == null
                    || StringUtils.isEmpty(henkiloSaved.getAsiointiKieli().getKieliKoodi())
                    || !henkiloUpdateDto.getAsiointiKieli().getKieliKoodi().equals(henkiloSaved.getAsiointiKieli().getKieliKoodi())) {
                this.kayttooikeusClient.ldapSynkroniseHenkilo(henkiloSaved.getOidHenkilo());
            }
            henkiloSaved.setAsiointiKieli(this.kielisyysRepository.findOrCreateByKoodi(henkiloUpdateDto.getAsiointiKieli().getKieliKoodi()));
            henkiloUpdateDto.setAsiointiKieli(null);
        }
        if (henkiloUpdateDto.getKielisyys() != null) {
            henkiloSaved.clearKielisyys();
            henkiloUpdateDto.getKielisyys().forEach(kielisyysDto -> henkiloSaved.addKielisyys(this.kielisyysRepository.findOrCreateByKoodi(kielisyysDto.getKieliKoodi())));
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
    public Henkilo update(Henkilo henkilo) {
        Date nyt = new Date();
        Optional<String> kayttajaOid = userDetailsHelper.findCurrentUserOid();

        henkilo.setModified(nyt);
        // jos käyttäjää ei ole tiedossa (esim. yksilöinnin tausta-ajo),
        // pidetään käsittelijä ennallaan
        kayttajaOid.ifPresent(henkilo::setKasittelijaOid);
        Henkilo tallennettu = henkiloDataRepository.save(henkilo);

        // päivitettäessä henkilöä, päivitetään samalla kaikkien slave-henkilöiden
        // modified-aikaleima, jotta myös slavet näkyvät muutosrajapinnassa
        henkiloDataRepository.findSlavesByMasterOid(tallennettu.getOidHenkilo()).forEach(slave -> {
            slave.setModified(nyt);
            kayttajaOid.ifPresent(slave::setKasittelijaOid);
            henkiloDataRepository.save(slave);
            // rakenne ei ole rekursiivinen (vaikka kantarakenne mahdollistaakin)
            // joten päivitystä ei tarvitse tehdä rekursiivisesti
        });

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
    @Transactional
    public FindOrCreateWrapper<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto) {
        return findHenkilo(henkiloPerustietoDto)
                .map(entity -> found(this.mapper.map(entity, HenkiloPerustietoDto.class)))
                .orElseGet(() -> created(this.createHenkilo(henkiloPerustietoDto)));
    }

    private Optional<Henkilo> findHenkilo(HenkiloPerustietoDto henkiloPerustietoDto) {
        return Stream.<Function<HenkiloPerustietoDto, Optional<Henkilo>>>of(
                dto -> Optional.ofNullable(dto.getOidHenkilo()).flatMap(oid -> Optional.of(this.henkiloService.getEntityByOid(oid))),
                dto -> Optional.ofNullable(dto.getExternalIds())
                        .filter(externalIds -> !externalIds.isEmpty())
                        .flatMap(externalIds -> findUnique(henkiloDataRepository.findByExternalIds(externalIds))),
                dto -> Optional.ofNullable(dto.getIdentifications())
                        .filter(identifications -> !identifications.isEmpty())
                        .flatMap(identifications -> findUnique(henkiloDataRepository.findByIdentifications(identifications))),
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
    public HenkiloDto createHenkilo(HenkiloCreateDto henkiloDto) {
        Henkilo henkilo = this.mapper.map(henkiloDto, Henkilo.class);
        return this.mapper.map(this.createHenkilo(henkilo), HenkiloDto.class);
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(HuoltajaCreateDto huoltajaCreateDto) {
        BindException errors = new BindException(huoltajaCreateDto, "huoltajaCreateDto");
        this.huoltajaCreatePostValidator.validate(huoltajaCreateDto, errors);
        if (errors.hasErrors()) {
            throw new UnprocessableEntityException(errors);
        }
        Henkilo henkilo = this.mapper.map(huoltajaCreateDto, Henkilo.class);
        return this.createHenkilo(henkilo, userDetailsHelper.getCurrentUserOid(), StringUtils.isEmpty(henkilo.getHetu()));
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
        if (StringUtils.isEmpty(henkiloCreate.getHetu())) {
            henkiloCreate.setHetu(null);
        }
        if (!StringUtils.isEmpty(henkiloCreate.getHetu()) && HetuUtils.hetuIsValid(henkiloCreate.getHetu())) {
            henkiloCreate.setSyntymaaika(HetuUtils.dateFromHetu(henkiloCreate.getHetu()));
            henkiloCreate.setSukupuoli(HetuUtils.sukupuoliFromHetu(henkiloCreate.getHetu()));
        }
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
            henkiloCreate.setOppijanumero(henkiloCreate.getOidHenkilo());
        }

        // hylätään tyhjät passinumerot
        if (henkiloCreate.getPassinumerot() != null) {
            Set<String> passinumerot = henkiloCreate.getPassinumerot().stream()
                    .filter(passinumero -> passinumero != null && !passinumero.trim().isEmpty())
                    .collect(toSet());
            henkiloCreate.setPassinumerot(passinumerot);
        }

        if (henkiloCreate.getAidinkieli() != null && henkiloCreate.getAidinkieli().getKieliKoodi() != null) {
            henkiloCreate.setAidinkieli(this.kielisyysRepository.findOrCreateByKoodi(henkiloCreate.getAidinkieli().getKieliKoodi()));
        }
        if (henkiloCreate.getAsiointiKieli() != null && henkiloCreate.getAsiointiKieli().getKieliKoodi() != null) {
            henkiloCreate.setAsiointiKieli(this.kielisyysRepository.findOrCreateByKoodi(henkiloCreate.getAsiointiKieli().getKieliKoodi()));
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
        if (this.henkiloService.getOidExists(newOid)) {
            return getFreePersonOid();
        }
        return newOid;
    }

}
