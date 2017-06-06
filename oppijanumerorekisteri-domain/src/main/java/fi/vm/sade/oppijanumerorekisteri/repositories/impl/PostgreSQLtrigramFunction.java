package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import org.hibernate.QueryException;
import org.hibernate.dialect.function.SQLFunction;
import org.hibernate.engine.spi.Mapping;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.type.BooleanType;
import org.hibernate.type.Type;

import java.util.List;

public class PostgreSQLtrigramFunction implements SQLFunction {
    @Override
    public String render(Type type, List args, SessionFactoryImplementor sessionFactoryImplementor) throws QueryException {
        if (args.size() != 2) {
            throw new IllegalArgumentException("The function must be passed 2 arguments");
        }
        String field = (String) args.get(0);
        String value = (String) args.get(1);
        // returns the string that will replace your function
        // in the sql script
        return field + " % " + value;
    }

    @Override
    public Type getReturnType(Type arg0, Mapping arg1) throws QueryException {
        return new BooleanType();
    }

    @Override
    public boolean hasArguments() {
        return true;
    }

    @Override
    public boolean hasParenthesesIfNoArguments() {
        return false;
    }
}
