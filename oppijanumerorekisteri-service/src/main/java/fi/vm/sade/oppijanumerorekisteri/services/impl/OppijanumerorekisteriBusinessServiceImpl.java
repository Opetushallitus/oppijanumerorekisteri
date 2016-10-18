package fi.vm.sade.oppijanumerorekisteri.services.impl;

import DTOs.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.beans.factory.annotation.Autowired;
import com.querydsl.core.types.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OppijanumerorekisteriBusinessServiceImpl implements OppijanumerorekisteriBusinessService {
    private HenkiloHibernateRepository henkiloRepository;
    private HenkiloRepository henkiloJpaRepository;
    private OrikaSpringMapper mapper;

    @Autowired
    public OppijanumerorekisteriBusinessServiceImpl(HenkiloHibernateRepository henkiloRepository,
                                                    HenkiloRepository henkiloJpaRepository,
                                                    OrikaSpringMapper mapper) {
        this.henkiloRepository = henkiloRepository;
        this.henkiloJpaRepository = henkiloJpaRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Boolean getHasHetu(String oid) {
        String hetu = henkiloRepository.getHetuByOid(oid);
        return hetu != null && !hetu.isEmpty();
    }

    @Transactional(readOnly = true)
    public boolean getOidExists(String oid) {
        Predicate searchPredicate = QHenkilo.henkilo.oidhenkilo.eq(oid);
        return this.henkiloJpaRepository.exists(searchPredicate);
    }

    @Transactional(readOnly = true)
    public String getOidByHetu(String hetu) {
        return this.henkiloRepository.getOidByHetu(hetu);
    }

    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietosByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloJpaRepository.findByOidhenkiloIsIn(oids);
        return mapper.mapAsList(henkilos, HenkiloPerustietoDto.class);
    }
}
