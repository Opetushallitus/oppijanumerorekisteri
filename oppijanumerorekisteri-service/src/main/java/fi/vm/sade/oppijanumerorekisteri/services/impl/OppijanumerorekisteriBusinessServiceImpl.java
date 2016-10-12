package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import com.querydsl.core.types.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OppijanumerorekisteriBusinessServiceImpl implements OppijanumerorekisteriBusinessService {
    private HenkiloHibernateRepository henkiloRepository;
    private HenkiloRepository henkiloJpaRepository;

    @Autowired
    public OppijanumerorekisteriBusinessServiceImpl(HenkiloHibernateRepository henkiloRepository,
                                                    HenkiloRepository henkiloJpaRepository) {
        this.henkiloRepository = henkiloRepository;
        this.henkiloJpaRepository = henkiloJpaRepository;
    }

    public Boolean getHasHetu(String oid) {
        String hetu = henkiloRepository.getHetuByOid(oid);
        return hetu != null && !hetu.isEmpty();
    }

    public boolean getOidExists(String oid) {
        Predicate searchpPredicate = QHenkilo.henkilo.oidhenkilo.eq(oid);
        return this.henkiloJpaRepository.exists(searchpPredicate);
    }

    public String getOidByHetu(String hetu) {
        return this.henkiloRepository.getOidByHetu(hetu);
    }
}
