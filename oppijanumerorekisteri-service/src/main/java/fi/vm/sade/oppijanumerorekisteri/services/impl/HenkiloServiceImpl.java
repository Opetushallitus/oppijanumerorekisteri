package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DuplicateHetuException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindException;

import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import org.joda.time.DateTime;
import org.springframework.util.StringUtils;

@Service
public class HenkiloServiceImpl implements HenkiloService {
    private final HenkiloJpaRepository henkiloJpaRepository;
    private final HenkiloRepository henkiloDataRepository;
    private final HenkiloViiteRepository henkiloViiteRepository;
    private final KielisyysRepository kielisyysRepository;
    private final KansalaisuusRepository kansalaisuusRepository;
    private final IdentificationRepository identificationRepository;

    private final YhteystietoConverter yhteystietoConverter;
    private final OrikaConfiguration mapper;
    private final OidGenerator oidGenerator;
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;
    private final HenkiloUpdatePostValidator henkiloUpdatePostValidator;
    private final HenkiloCreatePostValidator henkiloCreatePostValidator;

    @Autowired
    public HenkiloServiceImpl(HenkiloJpaRepository henkiloJpaRepository,
                              HenkiloRepository henkiloDataRepository,
                              HenkiloViiteRepository henkiloViiteRepository,
                              OrikaConfiguration mapper,
                              YhteystietoConverter yhteystietoConverter,
                              OidGenerator oidGenerator,
                              UserDetailsHelper userDetailsHelper,
                              KielisyysRepository kielisyysRepository,
                              KansalaisuusRepository kansalaisuusRepository,
                              IdentificationRepository identificationRepository,
                              PermissionChecker permissionChecker,
                              HenkiloUpdatePostValidator henkiloUpdatePostValidator,
                              HenkiloCreatePostValidator henkiloCreatePostValidator) {
        this.henkiloJpaRepository = henkiloJpaRepository;
        this.henkiloDataRepository = henkiloDataRepository;
        this.henkiloViiteRepository = henkiloViiteRepository;
        this.yhteystietoConverter = yhteystietoConverter;
        this.mapper = mapper;
        this.oidGenerator = oidGenerator;
        this.userDetailsHelper = userDetailsHelper;
        this.kielisyysRepository = kielisyysRepository;
        this.kansalaisuusRepository = kansalaisuusRepository;
        this.identificationRepository = identificationRepository;
        this.permissionChecker = permissionChecker;
        this.henkiloUpdatePostValidator = henkiloUpdatePostValidator;
        this.henkiloCreatePostValidator = henkiloCreatePostValidator;
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean getHasHetu() {
        Optional<String> hetu = this.henkiloJpaRepository.findHetuByOid(this.userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new));
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
        return this.mapper.map(getHenkiloByHetu(hetu).orElseThrow(NotFoundException::new), HenkiloOidHetuNimiDto.class);
    }

    private Optional<Henkilo> getHenkiloByHetu(String hetu) {
        List<Henkilo> henkiloListByHetu = this.henkiloDataRepository.findByHetu(hetu);
        if (henkiloListByHetu.size() > 1) {
            throw new DuplicateHetuException("Duplicate hetus found. Result would be undeterministic.");
        }
        return henkiloListByHetu.stream().findFirst();
    }

    @Override
    @Transactional
    public HenkiloPerustietoDto findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto) {
        HenkiloPerustietoDto returnHenkiloPerustietoDto = null;
        if (!StringUtils.isEmpty(henkiloPerustietoDto.getOidHenkilo())) {
            return this.mapper.map(this.getHenkilosByOids(Collections.singletonList(henkiloPerustietoDto.getOidHenkilo()))
                            .stream().findFirst().orElseThrow(NotFoundException::new),
                    HenkiloPerustietoDto.class);
        }
        if (!StringUtils.isEmpty(henkiloPerustietoDto.getExternalId())) {
            Optional<Henkilo> henkilo = henkiloJpaRepository.findByExternalId(henkiloPerustietoDto.getExternalId());
            if (henkilo.isPresent()) {
                return mapper.map(henkilo.get(), HenkiloPerustietoDto.class);
            }
        }
        Optional<Henkilo> henkilo = this.getHenkiloByHetu(henkiloPerustietoDto.getHetu());
        if (henkilo.isPresent()) {
            return this.mapper.map(henkilo.get(), HenkiloPerustietoDto.class);
        }

        Henkilo entity = this.createHenkilo(this.mapper.map(henkiloPerustietoDto, Henkilo.class));
        if (!StringUtils.isEmpty(henkiloPerustietoDto.getExternalId())) {
            ExternalId externalId = new ExternalId();
            externalId.setExternalid(henkiloPerustietoDto.getExternalId());
            externalId.setHenkilo(entity);
            entity.setExternalIds(Collections.singleton(externalId));
        }
        returnHenkiloPerustietoDto = this.mapper.map(entity, HenkiloPerustietoDto.class);
        returnHenkiloPerustietoDto.setCreatedOnService(true);
        return returnHenkiloPerustietoDto;
    }

    @Override
    @Transactional
    public List<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(List<HenkiloPerustietoDto> henkilot) {
        // Suorituskyvyn kannalta olisi järkevämpää hakea henkilöt ensin
        // tunnisteiden avulla ja vasta sitten luoda uudet henkilöt. Tässä
        // tapauksessa tunnisteita on kuitenkin useita (oid, externalid, hetu),
        // jolloin toteutuksesta tulisi tarpeettoman monimutkainen ylläpidon
        // kannalta.
        return henkilot.stream().map(this::findOrCreateHenkiloFromPerustietoDto).collect(toList());
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
    public HenkiloUpdateDto updateHenkiloFromHenkiloUpdateDto(HenkiloUpdateDto henkiloUpdateDto) {
        BindException errors = new BindException(henkiloUpdateDto, "henkiloUpdateDto");
        this.henkiloUpdatePostValidator.validate(henkiloUpdateDto, errors);
        if (errors.hasErrors()) {
            throw new ValidationException(errors);
        }

        Henkilo henkiloSaved = this.henkiloDataRepository.findByOidHenkiloIsIn(
                    Lists.newArrayList(henkiloUpdateDto.getOidHenkilo()))
                .stream().findFirst().orElseThrow(NotFoundException::new);

        henkiloSaved.setModified(new Date());
        henkiloSaved.setKasittelijaOid(userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new));

        // Do not update all values if henkilo is already vtj yksiloity
        if (henkiloSaved.isYksiloityVTJ()) {
            henkiloUpdateDto.setEtunimet(null);
            henkiloUpdateDto.setSukunimi(null);
            henkiloUpdateDto.setSukupuoli(null);
            henkiloUpdateDto.setHetu(null);
        }

        henkiloUpdateSetReusableFields(henkiloUpdateDto, henkiloSaved);

        this.mapper.map(henkiloUpdateDto, henkiloSaved);
        // This needs to be called in order to persist new yhteystiedotryhmas.
        this.henkiloDataRepository.save(henkiloSaved);
        return henkiloUpdateDto;
    }

    private void henkiloUpdateSetReusableFields(HenkiloUpdateDto henkiloUpdateDto, Henkilo henkiloSaved) {
        if (henkiloUpdateDto.getYhteystiedotRyhma() != null) {
            henkiloSaved.clearYhteystiedotRyhmas();
            henkiloUpdateDto.getYhteystiedotRyhma().forEach(yhteystiedotRyhmaDto -> {
                YhteystiedotRyhma yhteystiedotRyhma = this.mapper.map(yhteystiedotRyhmaDto, YhteystiedotRyhma.class);
                yhteystiedotRyhma.setHenkilo(henkiloSaved);
                if (yhteystiedotRyhma.getYhteystieto() != null) {
                    yhteystiedotRyhma.getYhteystieto().forEach(yhteystieto -> yhteystieto.setYhteystiedotRyhma(yhteystiedotRyhma));
                }
                henkiloSaved.addYhteystiedotRyhma(yhteystiedotRyhma);
            });
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
                    .map(k -> this.kansalaisuusRepository.findByKansalaisuusKoodi(k.getKansalaisuusKoodi())
                            .<ValidationException>orElseThrow(() -> new ValidationException("invalid.kansalaisuus")))
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
    public Optional<YhteystiedotDto> getHenkiloYhteystiedot(@NotNull String henkiloOid, @NotNull YhteystietoRyhmaKuvaus ryhma) {
        return ofNullable(yhteystietoConverter.toHenkiloYhteystiedot(
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
        Identification identification = this.identificationRepository.findByidpentityidAndIdentifier(idp, identifier)
                .orElseThrow(NotFoundException::new);
        return this.mapper.map(identification.getHenkilo(), HenkiloDto.class);
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
        return this.henkiloViiteRepository.findBy(criteria);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> findHenkiloOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince) {
        return this.henkiloJpaRepository.findOidsModifiedSince(criteria, modifiedSince);
    }

    @Override
    @Transactional
    public Henkilo createHenkilo(Henkilo henkiloCreate) {
        BindException errors = new BindException(henkiloCreate, "henkiloCreate");
        this.henkiloCreatePostValidator.validate(henkiloCreate, errors);
        if (errors.hasErrors()) {
            throw new ValidationException(errors);
        }

        henkiloCreate.setOidHenkilo(getFreePersonOid());
        henkiloCreate.setCreated(new Date());
        henkiloCreate.setModified(henkiloCreate.getCreated());
        henkiloCreate.setKasittelijaOid(userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new));

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
                    .map(k -> this.kansalaisuusRepository.findByKansalaisuusKoodi(k.getKansalaisuusKoodi())
                            .<ValidationException>orElseThrow(() -> new ValidationException("invalid.kansalaisuus")))
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
        Henkilo henkilo = this.getHenkiloByHetu(hetu)
                .orElseThrow(() -> new NotFoundException("Henkilöä ei löytynyt henkilötunnuksella " + hetu));
        return mapper.map(henkilo, HenkiloReadDto.class);
    }

}
