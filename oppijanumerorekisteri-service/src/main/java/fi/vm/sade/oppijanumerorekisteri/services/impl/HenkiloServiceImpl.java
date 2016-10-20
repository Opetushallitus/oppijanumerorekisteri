package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.beans.factory.annotation.Autowired;
import com.querydsl.core.types.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class HenkiloServiceImpl implements HenkiloService {
    private HenkiloHibernateRepository henkiloHibernateRepository;
    private HenkiloRepository henkiloDataRepository;
    private OrikaSpringMapper mapper;

    @Autowired
    public HenkiloServiceImpl(HenkiloHibernateRepository henkiloHibernateRepository,
                          HenkiloRepository henkiloDataRepository,
                          OrikaSpringMapper mapper) {
        this.henkiloHibernateRepository = henkiloHibernateRepository;
        this.henkiloDataRepository = henkiloDataRepository;
        this.mapper = mapper;
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
    public Optional<String> getOidByHetu(String hetu) {
        return this.henkiloHibernateRepository.findOidByHetu(hetu);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietosByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloDataRepository.findByOidhenkiloIsIn(oids);
        return mapper.mapAsList(henkilos, HenkiloPerustietoDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi) {
        List<String> etunimetList = Arrays.stream(etunimet.split(" ")).collect(Collectors.toList());
        List<Henkilo> henkilos = this.henkiloHibernateRepository.findHenkiloByEtunimetOrSukunimi(etunimetList, sukunimi);
        return this.mapper.mapAsList(henkilos, HenkiloOidHetuNimiDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByHetu(String hetu) {
        Henkilo henkilo = this.henkiloDataRepository.findByHetu(hetu);
        return Optional.ofNullable(mapper.map(henkilo, HenkiloOidHetuNimiDto.class));
    }
}
