package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import org.hibernate.dialect.PostgreSQL92Dialect;

public class PostgreSQLDialect extends PostgreSQL92Dialect {
    public PostgreSQLDialect() {
        super();
        registerFunction("trgm_match", new PostgreSQLtrigramFunction());
    }
}
