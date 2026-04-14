package fi.vm.sade.oppijanumerorekisteri;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class DatabaseService {
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void runInTransaction(Runnable runnable) {
        transactionTemplate.executeWithoutResult((t) -> runnable.run());
    }
}
