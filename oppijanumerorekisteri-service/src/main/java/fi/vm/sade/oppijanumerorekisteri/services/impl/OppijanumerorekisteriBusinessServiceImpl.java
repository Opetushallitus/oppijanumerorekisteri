package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OppijanumerorekisteriBusinessServiceImpl implements OppijanumerorekisteriBusinessService {
    private HenkiloHibernateRepository henkiloRepository;

    @Autowired
    public OppijanumerorekisteriBusinessServiceImpl(HenkiloHibernateRepository henkiloRepository) {
        this.henkiloRepository = henkiloRepository;
    }

    public Boolean getHasHetu(String oid) {
        String hetu = henkiloRepository.getHetuByOid(oid);
        return !hetu.isEmpty();
    }
}
