package fi.vm.sade.oppijanumerorekisteri;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.ResultSet;

@Service
public class DatabaseService {

    private static final String TABLE_QUERY = "SELECT TABLE_NAME\n" +
            "FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE != 'VIEW' AND IS_INSERTABLE_INTO = 'YES'";

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void truncate() {
        jdbcTemplate.execute("set referential_integrity false");
        jdbcTemplate.query(TABLE_QUERY, (ResultSet rs, int rowNum) -> rs.getString("table_name"))
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
