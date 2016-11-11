package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.ValidationException;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;

@Service
public class HenkiloServiceImpl implements HenkiloService {
    private HenkiloHibernateRepository henkiloHibernateRepository;
    private HenkiloRepository henkiloDataRepository;
    private KielisyysRepository kielisyysRepository;
    private KansalaisuusRepository kansalaisuusRepository;

    private YhteystietoConverter yhteystietoConverter;
    private OrikaSpringMapper mapper;
    private OidGenerator oidGenerator;
    private UserDetailsHelper userDetailsHelper;

    private KoodistoService koodistoService;

    @Autowired
    public HenkiloServiceImpl(HenkiloHibernateRepository henkiloHibernateRepository,
                              HenkiloRepository henkiloDataRepository,
                              OrikaSpringMapper mapper,
                              YhteystietoConverter yhteystietoConverter,
                              OidGenerator oidGenerator,
                              UserDetailsHelper userDetailsHelper,
                              KielisyysRepository kielisyysRepository,
                              KoodistoService koodistoService,
                              KansalaisuusRepository kansalaisuusRepository) {
        this.henkiloHibernateRepository = henkiloHibernateRepository;
        this.henkiloDataRepository = henkiloDataRepository;
        this.yhteystietoConverter = yhteystietoConverter;
        this.mapper = mapper;
        this.oidGenerator = oidGenerator;
        this.userDetailsHelper = userDetailsHelper;
        this.kielisyysRepository = kielisyysRepository;
        this.koodistoService = koodistoService;
        this.kansalaisuusRepository = kansalaisuusRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean getHasHetu() {
        Optional<String> hetu = henkiloHibernateRepository.findHetuByOid(this.userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new));
        return !hetu.orElse("").isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean getOidExists(String oid) {
        Predicate searchPredicate = QHenkilo.henkilo.oidhenkilo.eq(oid);
        return this.henkiloDataRepository.exists(searchPredicate);
    }

    @Override
    @Transactional(readOnly = true)
    public String getOidByHetu(String hetu) {
        return this.henkiloHibernateRepository.findOidByHetu(hetu).orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findByOidhenkiloIsIn(oids);
        return this.mapper.mapAsList(henkilos, HenkiloPerustietoDto.class);
    }

    @Override
    public List<HenkiloDto> getHenkiloByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findByOidhenkiloIsIn(oids);
        if(henkilos.isEmpty()) {
            throw new NotFoundException();
        }
        return this.mapper.mapAsList(henkilos, HenkiloDto.class);
    }


    @Override
    @Transactional(readOnly = true)
    public List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi) {
        List<String> etunimetList = Arrays.stream(etunimet.split(" ")).collect(Collectors.toList());
        List<Henkilo> henkilos = this.henkiloHibernateRepository.findHenkiloOidHetuNimisByEtunimetOrSukunimi(etunimetList, sukunimi);
        return this.mapper.mapAsList(henkilos, HenkiloOidHetuNimiDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu) {
        Optional<Henkilo> henkilo = this.henkiloDataRepository.findByHetu(hetu);
        return mapper.map(henkilo.orElseThrow(NotFoundException::new), HenkiloOidHetuNimiDto.class);
    }

    @Override
    @Transactional
    public HenkiloPerustietoDto createHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto) {
        Henkilo henkilo = mapper.map(henkiloPerustietoDto, Henkilo.class);
        return mapper.map(this.createHenkilo(henkilo), HenkiloPerustietoDto.class);
    }

    @Override
    public HenkiloDto createHenkiloFromHenkiloDTo(HenkiloDto henkiloDto) {
        Henkilo henkilo = mapper.map(henkiloDto, Henkilo.class);
        return mapper.map(this.createHenkilo(henkilo), HenkiloDto.class);
    }


    @Override
    @Transactional(readOnly = true)
    public HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(@NotNull String henkiloOid) {
        return new HenkilonYhteystiedotViewDto(yhteystietoConverter.toHenkiloYhteystiedot(
                henkiloHibernateRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid(henkiloOid))
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<YhteystiedotDto> getHenkiloYhteystiedot(@NotNull String henkiloOid, @NotNull YhteystietoRyhma ryhma) {
        return ofNullable(yhteystietoConverter.toHenkiloYhteystiedot(
                henkiloHibernateRepository.findYhteystiedot(new YhteystietoCriteria()
                        .withHenkiloOid(henkiloOid)
                        .withRyhma(ryhma))
        ).get(ryhma));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit) {
        List<Henkilo> hetusAndOids = henkiloHibernateRepository.findHetusAndOids(syncedBeforeTimestamp, offset, limit);
        return mapper.mapAsList(hetusAndOids, HenkiloHetuAndOidDto.class);
    }

    private Henkilo createHenkilo(Henkilo henkilo) {
        henkilo.setOidhenkilo(getFreePersonOid());
        henkilo.setLuontiPvm(new Date());
        henkilo.setMuokkausPvm(henkilo.getLuontiPvm());
        henkilo.setKasittelijaOid(userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new));

        if(henkilo.getAidinkieli() != null && henkilo.getAidinkieli().getKielikoodi() != null) {
            henkilo.setAidinkieli(this.kielisyysRepository.findByKielikoodi(henkilo.getAidinkieli().getKielikoodi())
                    .orElseThrow(() -> new ValidationException("invalid_aidinkieli")));
        }
        if(henkilo.getAsiointikieli() != null && henkilo.getAsiointikieli().getKielikoodi() != null) {
            henkilo.setAsiointikieli(this.kielisyysRepository.findByKielikoodi(henkilo.getAsiointikieli().getKielikoodi())
                    .orElseThrow(() -> new ValidationException("invalid_asiointikieli")));
        }
        if(henkilo.getKansalaisuus() != null) {
            koodistoService.validateKansalaisuus(henkilo.getKansalaisuus());
            Set<Kansalaisuus> kansalaisuusSet = henkilo.getKansalaisuus().stream()
                    .map(k -> this.kansalaisuusRepository.findByKansalaisuuskoodi(k.getKansalaisuuskoodi())
                            .orElseThrow(ValidationException::new))
                    .collect(Collectors.toSet());
            henkilo.setKansalaisuus(kansalaisuusSet);
        }

        return this.henkiloDataRepository.save(henkilo);
    }

    private String getFreePersonOid() {
        final String newOid = oidGenerator.generateOID();
        if (this.getOidExists(newOid)) {
            return getFreePersonOid();
        }
        return newOid;
    }

}
