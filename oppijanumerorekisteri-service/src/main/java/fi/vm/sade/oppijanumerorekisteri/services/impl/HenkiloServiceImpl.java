package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloKoskiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.beans.factory.annotation.Autowired;
import com.querydsl.core.types.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class HenkiloServiceImpl implements HenkiloService {
    private HenkiloHibernateRepository henkiloHibernateRepository;
    private HenkiloRepository henkiloDataRepository;
    private OrikaSpringMapper mapper;
    private OidGenerator oidGenerator;

    @Autowired
    public HenkiloServiceImpl(HenkiloHibernateRepository henkiloHibernateRepository,
                            HenkiloRepository henkiloDataRepository,
                            OrikaSpringMapper mapper,
                            OidGenerator oidGenerator) {
        this.henkiloHibernateRepository = henkiloHibernateRepository;
        this.henkiloDataRepository = henkiloDataRepository;
        this.mapper = mapper;
        this.oidGenerator = oidGenerator;
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean getHasHetu(String oid) {
        Optional<String> hetu = henkiloHibernateRepository.findHetuByOid(oid);
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
    public List<HenkiloKoskiDto> getHenkiloKoskiPerustietoByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findByOidhenkiloIsIn(oids);
        return mapper.mapAsList(henkilos, HenkiloKoskiDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findByOidhenkiloIn(oids);
        return mapper.mapAsList(henkilos, HenkiloPerustietoDto.class);
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
    public HenkiloKoskiDto createHenkiloFromKoskiDto(HenkiloKoskiDto henkiloKoskiDto) {
        Henkilo henkilo = mapper.map(henkiloKoskiDto, Henkilo.class);
        henkilo.setHenkilotyyppi(HenkiloTyyppi.OPPIJA);
        return mapper.map(this.createHenkilo(henkilo), HenkiloKoskiDto.class);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    private Henkilo createHenkilo(Henkilo henkilo) {
        henkilo.setOidhenkilo(getFreePersonOid());
        henkilo.setLuontiPvm(new Date());
        henkilo.setMuokkausPvm(new Date());
        return this.henkiloDataRepository.save(henkilo);
    }

    @Transactional(readOnly = true)
    private String getFreePersonOid() {
        final String newOid = oidGenerator.generateOID();
        if (!this.getOidExists(newOid)) return getFreePersonOid();
        return newOid;
    }
}
