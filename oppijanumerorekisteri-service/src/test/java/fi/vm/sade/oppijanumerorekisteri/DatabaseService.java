package fi.vm.sade.oppijanumerorekisteri;

import java.sql.ResultSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void truncate() {
        jdbcTemplate.execute("set referential_integrity false");
        jdbcTemplate.query("show tables", (ResultSet rs, int rowNum) -> rs.getString("table_name"))
                .forEach(tableName -> jdbcTemplate.execute(String.format("truncate table %s", tableName)));
        jdbcTemplate.execute("set referential_integrity true");
    }

}
