package fi.vm.sade.oppijanumerorekisteri;

import java.sql.ResultSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class DatabaseService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void truncate() {
        jdbcTemplate.execute("set referential_integrity false");
        jdbcTemplate.query("show tables", (ResultSet rs, int rowNum) -> rs.getString("table_name"))
                .forEach(tableName -> jdbcTemplate.execute(String.format("truncate table %s", tableName)));
        jdbcTemplate.execute("set referential_integrity true");
    }

    public void runInTransaction(Runnable runnable) {
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                runnable.run();
            }
        });
    }

}
