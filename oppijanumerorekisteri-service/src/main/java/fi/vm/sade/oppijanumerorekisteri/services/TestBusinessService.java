package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.repositories.TestDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestBusinessService {
    private TestDao testDao;

    @Autowired
    public TestBusinessService(TestDao testDao) {
        this.testDao = testDao;
    }

    public long getHenkiloCountFromDb() {
        return testDao.count();
    }
}
