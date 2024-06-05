/*
 * Copyright 2014-2022 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package fi.vm.sade.oppijanumerorekisteri;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.convert.ConversionService;
import org.springframework.core.convert.TypeDescriptor;
import org.springframework.core.convert.support.GenericConversionService;
import org.springframework.core.serializer.support.DeserializingConverter;
import org.springframework.core.serializer.support.SerializingConverter;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.support.lob.DefaultLobHandler;
import org.springframework.jdbc.support.lob.LobCreator;
import org.springframework.jdbc.support.lob.LobHandler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.session.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionOperations;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;

// Copy of org.springframework.session.jdbc.JdbcIndexedSessionRepository but doesn't mark session as changed when last accessed time is updated:
// This avoid unnecessary updates that cause locking issues when services use single session to do concurrent requests.
@Slf4j
public class LastAccessedTimeIgnoringJdbcIndexedSessionRepository implements FindByIndexNameSessionRepository<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession>, InitializingBean, DisposableBean {

    /**
     * The default name of database table used by Spring Session to store sessions.
     */
    public static final String DEFAULT_TABLE_NAME = "SPRING_SESSION";

    /**
     * The default cron expression used for expired session cleanup job.
     */
    public static final String DEFAULT_CLEANUP_CRON = "0 * * * * *";

    private static final String SPRING_SECURITY_CONTEXT = "SPRING_SECURITY_CONTEXT";

    private static final String CREATE_SESSION_QUERY = """
			INSERT INTO %TABLE_NAME% (PRIMARY_ID, SESSION_ID, CREATION_TIME, LAST_ACCESS_TIME, MAX_INACTIVE_INTERVAL, EXPIRY_TIME, PRINCIPAL_NAME)
			VALUES (?, ?, ?, ?, ?, ?, ?)
			""";

    private static final String CREATE_SESSION_ATTRIBUTE_QUERY = """
			INSERT INTO %TABLE_NAME%_ATTRIBUTES (SESSION_PRIMARY_ID, ATTRIBUTE_NAME, ATTRIBUTE_BYTES)
			VALUES (?, ?, ?)
			""";

    private static final String GET_SESSION_QUERY = """
			SELECT S.PRIMARY_ID, S.SESSION_ID, S.CREATION_TIME, S.LAST_ACCESS_TIME, S.MAX_INACTIVE_INTERVAL, SA.ATTRIBUTE_NAME, SA.ATTRIBUTE_BYTES
			FROM %TABLE_NAME% S
			LEFT JOIN %TABLE_NAME%_ATTRIBUTES SA ON S.PRIMARY_ID = SA.SESSION_PRIMARY_ID
			WHERE S.SESSION_ID = ?
			""";

    private static final String UPDATE_SESSION_QUERY = """
			UPDATE %TABLE_NAME%
			SET SESSION_ID = ?, LAST_ACCESS_TIME = ?, MAX_INACTIVE_INTERVAL = ?, EXPIRY_TIME = ?, PRINCIPAL_NAME = ?
			WHERE PRIMARY_ID = ?
			""";

    private static final String UPDATE_SESSION_ATTRIBUTE_QUERY = """
			UPDATE %TABLE_NAME%_ATTRIBUTES
			SET ATTRIBUTE_BYTES = ?
			WHERE SESSION_PRIMARY_ID = ?
			AND ATTRIBUTE_NAME = ?
			""";

    private static final String DELETE_SESSION_ATTRIBUTE_QUERY = """
			DELETE FROM %TABLE_NAME%_ATTRIBUTES
			WHERE SESSION_PRIMARY_ID = ?
			AND ATTRIBUTE_NAME = ?
			""";

    private static final String DELETE_SESSION_QUERY = """
			DELETE FROM %TABLE_NAME%
			WHERE SESSION_ID = ?
			AND MAX_INACTIVE_INTERVAL >= 0
			""";

    private static final String LIST_SESSIONS_BY_PRINCIPAL_NAME_QUERY = """
			SELECT S.PRIMARY_ID, S.SESSION_ID, S.CREATION_TIME, S.LAST_ACCESS_TIME, S.MAX_INACTIVE_INTERVAL, SA.ATTRIBUTE_NAME, SA.ATTRIBUTE_BYTES
			FROM %TABLE_NAME% S
			LEFT JOIN %TABLE_NAME%_ATTRIBUTES SA ON S.PRIMARY_ID = SA.SESSION_PRIMARY_ID
			WHERE S.PRINCIPAL_NAME = ?
			""";

    private static final String DELETE_SESSIONS_BY_EXPIRY_TIME_QUERY = """
			DELETE FROM %TABLE_NAME%
			WHERE EXPIRY_TIME < ?
			""";

    private static final Log logger = LogFactory.getLog(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.class);

    private final JdbcOperations jdbcOperations;

    private final TransactionOperations transactionOperations;

    private final ResultSetExtractor<List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession>> extractor = new LastAccessedTimeIgnoringJdbcIndexedSessionRepository.SessionResultSetExtractor();

    /**
     * The name of database table used by Spring Session to store sessions.
     */
    private String tableName = DEFAULT_TABLE_NAME;

    private String createSessionQuery;

    private String createSessionAttributeQuery;

    private String getSessionQuery;

    private String updateSessionQuery;

    private String updateSessionAttributeQuery;

    private String deleteSessionAttributeQuery;

    private String deleteSessionQuery;

    private String listSessionsByPrincipalNameQuery;

    private String deleteSessionsByExpiryTimeQuery;

    private Duration defaultMaxInactiveInterval = Duration.ofSeconds(MapSession.DEFAULT_MAX_INACTIVE_INTERVAL_SECONDS);

    private IndexResolver<Session> indexResolver = new DelegatingIndexResolver<>(new PrincipalNameIndexResolver<>());

    private ConversionService conversionService = createDefaultConversionService();

    private LobHandler lobHandler = new DefaultLobHandler();

    private FlushMode flushMode = FlushMode.ON_SAVE;

    private SaveMode saveMode = SaveMode.ON_SET_ATTRIBUTE;

    private String cleanupCron = DEFAULT_CLEANUP_CRON;

    private ThreadPoolTaskScheduler taskScheduler;

    private SessionIdGenerator sessionIdGenerator = UuidSessionIdGenerator.getInstance();

    /**
     * Create a new {@link LastAccessedTimeIgnoringJdbcIndexedSessionRepository} instance which uses the provided
     * {@link JdbcOperations} and {@link TransactionOperations} to manage sessions.
     * @param jdbcOperations the {@link JdbcOperations} to use
     * @param transactionOperations the {@link TransactionOperations} to use
     */
    public LastAccessedTimeIgnoringJdbcIndexedSessionRepository(JdbcOperations jdbcOperations, TransactionOperations transactionOperations) {
        log.info("Creating LastAccessedTimeIgnoringJdbcIndexedSessionRepository");
        Assert.notNull(jdbcOperations, "jdbcOperations must not be null");
        Assert.notNull(transactionOperations, "transactionOperations must not be null");
        this.jdbcOperations = jdbcOperations;
        this.transactionOperations = transactionOperations;
        prepareQueries();
    }

    @Override
    public void afterPropertiesSet() {
        if (!Scheduled.CRON_DISABLED.equals(this.cleanupCron)) {
            this.taskScheduler = createTaskScheduler();
            this.taskScheduler.initialize();
            this.taskScheduler.schedule(this::cleanUpExpiredSessions, new CronTrigger(this.cleanupCron));
        }
    }

    private static ThreadPoolTaskScheduler createTaskScheduler() {
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.setThreadNamePrefix("spring-session-");
        return taskScheduler;
    }

    @Override
    public void destroy() {
        if (this.taskScheduler != null) {
            this.taskScheduler.destroy();
        }
    }

    /**
     * Set the name of database table used to store sessions.
     * @param tableName the database table name
     */
    public void setTableName(String tableName) {
        Assert.hasText(tableName, "Table name must not be empty");
        this.tableName = tableName.trim();
        prepareQueries();
    }

    /**
     * Set the custom SQL query used to create the session.
     * @param createSessionQuery the SQL query string
     */
    public void setCreateSessionQuery(String createSessionQuery) {
        Assert.hasText(createSessionQuery, "Query must not be empty");
        this.createSessionQuery = getQuery(createSessionQuery);
    }

    /**
     * Set the custom SQL query used to create the session attribute.
     * @param createSessionAttributeQuery the SQL query string
     */
    public void setCreateSessionAttributeQuery(String createSessionAttributeQuery) {
        Assert.hasText(createSessionAttributeQuery, "Query must not be empty");
        this.createSessionAttributeQuery = getQuery(createSessionAttributeQuery);
    }

    /**
     * Set the custom SQL query used to retrieve the session.
     * @param getSessionQuery the SQL query string
     */
    public void setGetSessionQuery(String getSessionQuery) {
        Assert.hasText(getSessionQuery, "Query must not be empty");
        this.getSessionQuery = getQuery(getSessionQuery);
    }

    /**
     * Set the custom SQL query used to update the session.
     * @param updateSessionQuery the SQL query string
     */
    public void setUpdateSessionQuery(String updateSessionQuery) {
        Assert.hasText(updateSessionQuery, "Query must not be empty");
        this.updateSessionQuery = getQuery(updateSessionQuery);
    }

    /**
     * Set the custom SQL query used to update the session attribute.
     * @param updateSessionAttributeQuery the SQL query string
     */
    public void setUpdateSessionAttributeQuery(String updateSessionAttributeQuery) {
        Assert.hasText(updateSessionAttributeQuery, "Query must not be empty");
        this.updateSessionAttributeQuery = getQuery(updateSessionAttributeQuery);
    }

    /**
     * Set the custom SQL query used to delete the session attribute.
     * @param deleteSessionAttributeQuery the SQL query string
     */
    public void setDeleteSessionAttributeQuery(String deleteSessionAttributeQuery) {
        Assert.hasText(deleteSessionAttributeQuery, "Query must not be empty");
        this.deleteSessionAttributeQuery = getQuery(deleteSessionAttributeQuery);
    }

    /**
     * Set the custom SQL query used to delete the session.
     * @param deleteSessionQuery the SQL query string
     */
    public void setDeleteSessionQuery(String deleteSessionQuery) {
        Assert.hasText(deleteSessionQuery, "Query must not be empty");
        this.deleteSessionQuery = getQuery(deleteSessionQuery);
    }

    /**
     * Set the custom SQL query used to retrieve the sessions by principal name.
     * @param listSessionsByPrincipalNameQuery the SQL query string
     */
    public void setListSessionsByPrincipalNameQuery(String listSessionsByPrincipalNameQuery) {
        Assert.hasText(listSessionsByPrincipalNameQuery, "Query must not be empty");
        this.listSessionsByPrincipalNameQuery = getQuery(listSessionsByPrincipalNameQuery);
    }

    /**
     * Set the custom SQL query used to delete the sessions by last access time.
     * @param deleteSessionsByExpiryTimeQuery the SQL query string
     */
    public void setDeleteSessionsByExpiryTimeQuery(String deleteSessionsByExpiryTimeQuery) {
        Assert.hasText(deleteSessionsByExpiryTimeQuery, "Query must not be empty");
        this.deleteSessionsByExpiryTimeQuery = getQuery(deleteSessionsByExpiryTimeQuery);
    }

    /**
     * Set the maximum inactive interval in seconds between requests before newly created
     * sessions will be invalidated. A negative time indicates that the session will never
     * time out. The default is 30 minutes.
     * @param defaultMaxInactiveInterval the default maxInactiveInterval
     */
    public void setDefaultMaxInactiveInterval(Duration defaultMaxInactiveInterval) {
        Assert.notNull(defaultMaxInactiveInterval, "defaultMaxInactiveInterval must not be null");
        this.defaultMaxInactiveInterval = defaultMaxInactiveInterval;
    }

    /**
     * Set the maximum inactive interval in seconds between requests before newly created
     * sessions will be invalidated. A negative time indicates that the session will never
     * time out. The default is 1800 (30 minutes).
     * @param defaultMaxInactiveInterval the default maxInactiveInterval in seconds
     * @deprecated since 3.0.0, in favor of
     * {@link #setDefaultMaxInactiveInterval(Duration)}
     */
    @Deprecated(since = "3.0.0")
    public void setDefaultMaxInactiveInterval(Integer defaultMaxInactiveInterval) {
        setDefaultMaxInactiveInterval(Duration.ofSeconds(defaultMaxInactiveInterval));
    }

    /**
     * Set the {@link IndexResolver} to use.
     * @param indexResolver the index resolver
     */
    public void setIndexResolver(IndexResolver<Session> indexResolver) {
        Assert.notNull(indexResolver, "indexResolver cannot be null");
        this.indexResolver = indexResolver;
    }

    public void setLobHandler(LobHandler lobHandler) {
        Assert.notNull(lobHandler, "LobHandler must not be null");
        this.lobHandler = lobHandler;
    }

    /**
     * Sets the {@link ConversionService} to use.
     * @param conversionService the converter to set
     */
    public void setConversionService(ConversionService conversionService) {
        Assert.notNull(conversionService, "conversionService must not be null");
        this.conversionService = conversionService;
    }

    /**
     * Set the flush mode. Default is {@link FlushMode#ON_SAVE}.
     * @param flushMode the flush mode
     */
    public void setFlushMode(FlushMode flushMode) {
        Assert.notNull(flushMode, "flushMode must not be null");
        this.flushMode = flushMode;
    }

    /**
     * Set the save mode.
     * @param saveMode the save mode
     */
    public void setSaveMode(SaveMode saveMode) {
        Assert.notNull(saveMode, "saveMode must not be null");
        this.saveMode = saveMode;
    }

    /**
     * Set the cleanup cron expression.
     * @param cleanupCron the cleanup cron expression
     * @since 3.0.0
     * @see CronExpression
     * @see Scheduled#CRON_DISABLED
     */
    public void setCleanupCron(String cleanupCron) {
        Assert.notNull(cleanupCron, "cleanupCron must not be null");
        if (!Scheduled.CRON_DISABLED.equals(cleanupCron)) {
            Assert.isTrue(CronExpression.isValidExpression(cleanupCron), "cleanupCron must be valid");
        }
        this.cleanupCron = cleanupCron;
    }

    @Override
    public LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession createSession() {
        MapSession delegate = new MapSession(this.sessionIdGenerator);
        delegate.setMaxInactiveInterval(this.defaultMaxInactiveInterval);
        LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session = new LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession(delegate, UUID.randomUUID().toString(), true);
        session.flushIfRequired();
        return session;
    }

    @Override
    public void save(final LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session) {
        session.save();
    }

    @Override
    public LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession findById(final String id) {
        final LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session = this.transactionOperations.execute((status) -> {
            List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> sessions = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.jdbcOperations.query(
                    LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.getSessionQuery, (ps) -> ps.setString(1, id),
                    LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.extractor);
            if (sessions.isEmpty()) {
                return null;
            }
            return sessions.get(0);
        });

        if (session != null) {
            if (session.isExpired()) {
                deleteById(id);
            }
            else {
                return session;
            }
        }
        return null;
    }

    @Override
    public void deleteById(final String id) {
        this.transactionOperations.executeWithoutResult((status) -> LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.jdbcOperations
                .update(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.deleteSessionQuery, id));
    }

    @Override
    public Map<String, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> findByIndexNameAndIndexValue(String indexName, final String indexValue) {
        if (!PRINCIPAL_NAME_INDEX_NAME.equals(indexName)) {
            return Collections.emptyMap();
        }

        List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> sessions = this.transactionOperations
                .execute((status) -> LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.jdbcOperations.query(
                        LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.listSessionsByPrincipalNameQuery,
                        (ps) -> ps.setString(1, indexValue), LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.extractor));

        Map<String, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> sessionMap = new HashMap<>(sessions.size());

        for (LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session : sessions) {
            sessionMap.put(session.getId(), session);
        }

        return sessionMap;
    }

    private void insertSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session, List<String> attributeNames) {
        Assert.notEmpty(attributeNames, "attributeNames must not be null or empty");
        try (LobCreator lobCreator = this.lobHandler.getLobCreator()) {
            if (attributeNames.size() > 1) {
                try {
                    this.jdbcOperations.batchUpdate(this.createSessionAttributeQuery,
                            new BatchPreparedStatementSetter() {

                                @Override
                                public void setValues(PreparedStatement ps, int i) throws SQLException {
                                    String attributeName = attributeNames.get(i);
                                    ps.setString(1, session.primaryKey);
                                    ps.setString(2, attributeName);
                                    lobCreator.setBlobAsBytes(ps, 3, serialize(session.getAttribute(attributeName)));
                                }

                                @Override
                                public int getBatchSize() {
                                    return attributeNames.size();
                                }

                            });
                }
                catch (DuplicateKeyException ex) {
                    throw ex;
                }
                catch (DataIntegrityViolationException ex) {
                    // parent record not found - we are ignoring this error because we
                    // assume that a concurrent request has removed the session
                    if (logger.isTraceEnabled()) {
                        logger.trace("Not able to create session attributes", ex);
                    }
                }
            }
            else {
                try {
                    this.jdbcOperations.update(this.createSessionAttributeQuery, (ps) -> {
                        String attributeName = attributeNames.get(0);
                        ps.setString(1, session.primaryKey);
                        ps.setString(2, attributeName);
                        lobCreator.setBlobAsBytes(ps, 3, serialize(session.getAttribute(attributeName)));
                    });
                }
                catch (DuplicateKeyException ex) {
                    throw ex;
                }
                catch (DataIntegrityViolationException ex) {
                    // parent record not found - we are ignoring this error because we
                    // assume that a concurrent request has removed the session
                    if (logger.isTraceEnabled()) {
                        logger.trace("Not able to create session attributes", ex);
                    }
                }
            }
        }
    }

    private void updateSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session, List<String> attributeNames) {
        Assert.notEmpty(attributeNames, "attributeNames must not be null or empty");
        try (LobCreator lobCreator = this.lobHandler.getLobCreator()) {
            if (attributeNames.size() > 1) {
                this.jdbcOperations.batchUpdate(this.updateSessionAttributeQuery, new BatchPreparedStatementSetter() {

                    @Override
                    public void setValues(PreparedStatement ps, int i) throws SQLException {
                        String attributeName = attributeNames.get(i);
                        lobCreator.setBlobAsBytes(ps, 1, serialize(session.getAttribute(attributeName)));
                        ps.setString(2, session.primaryKey);
                        ps.setString(3, attributeName);
                    }

                    @Override
                    public int getBatchSize() {
                        return attributeNames.size();
                    }

                });
            }
            else {
                this.jdbcOperations.update(this.updateSessionAttributeQuery, (ps) -> {
                    String attributeName = attributeNames.get(0);
                    lobCreator.setBlobAsBytes(ps, 1, serialize(session.getAttribute(attributeName)));
                    ps.setString(2, session.primaryKey);
                    ps.setString(3, attributeName);
                });
            }
        }
    }

    private void deleteSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session, List<String> attributeNames) {
        Assert.notEmpty(attributeNames, "attributeNames must not be null or empty");
        if (attributeNames.size() > 1) {
            this.jdbcOperations.batchUpdate(this.deleteSessionAttributeQuery, new BatchPreparedStatementSetter() {

                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    String attributeName = attributeNames.get(i);
                    ps.setString(1, session.primaryKey);
                    ps.setString(2, attributeName);
                }

                @Override
                public int getBatchSize() {
                    return attributeNames.size();
                }

            });
        }
        else {
            this.jdbcOperations.update(this.deleteSessionAttributeQuery, (ps) -> {
                String attributeName = attributeNames.get(0);
                ps.setString(1, session.primaryKey);
                ps.setString(2, attributeName);
            });
        }
    }

    public void cleanUpExpiredSessions() {
        Integer deletedCount = this.transactionOperations
                .execute((status) -> LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.jdbcOperations
                        .update(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.deleteSessionsByExpiryTimeQuery, System.currentTimeMillis()));

        if (logger.isDebugEnabled()) {
            logger.debug("Cleaned up " + deletedCount + " expired sessions");
        }
    }

    private static GenericConversionService createDefaultConversionService() {
        GenericConversionService converter = new GenericConversionService();
        converter.addConverter(Object.class, byte[].class, new SerializingConverter());
        converter.addConverter(byte[].class, Object.class, new DeserializingConverter());
        return converter;
    }

    private String getQuery(String base) {
        return StringUtils.replace(base, "%TABLE_NAME%", this.tableName);
    }

    private void prepareQueries() {
        this.createSessionQuery = getQuery(CREATE_SESSION_QUERY);
        this.createSessionAttributeQuery = getQuery(CREATE_SESSION_ATTRIBUTE_QUERY);
        this.getSessionQuery = getQuery(GET_SESSION_QUERY);
        this.updateSessionQuery = getQuery(UPDATE_SESSION_QUERY);
        this.updateSessionAttributeQuery = getQuery(UPDATE_SESSION_ATTRIBUTE_QUERY);
        this.deleteSessionAttributeQuery = getQuery(DELETE_SESSION_ATTRIBUTE_QUERY);
        this.deleteSessionQuery = getQuery(DELETE_SESSION_QUERY);
        this.listSessionsByPrincipalNameQuery = getQuery(LIST_SESSIONS_BY_PRINCIPAL_NAME_QUERY);
        this.deleteSessionsByExpiryTimeQuery = getQuery(DELETE_SESSIONS_BY_EXPIRY_TIME_QUERY);
    }

    private LobHandler getLobHandler() {
        return this.lobHandler;
    }

    private byte[] serialize(Object object) {
        return (byte[]) this.conversionService.convert(object, TypeDescriptor.valueOf(Object.class),
                TypeDescriptor.valueOf(byte[].class));
    }

    private Object deserialize(byte[] bytes) {
        return this.conversionService.convert(bytes, TypeDescriptor.valueOf(byte[].class),
                TypeDescriptor.valueOf(Object.class));
    }

    /**
     * Set the {@link SessionIdGenerator} to use to generate session ids.
     * @param sessionIdGenerator the {@link SessionIdGenerator} to use
     * @since 3.2
     */
    public void setSessionIdGenerator(SessionIdGenerator sessionIdGenerator) {
        Assert.notNull(sessionIdGenerator, "sessionIdGenerator cannot be null");
        this.sessionIdGenerator = sessionIdGenerator;
    }

    private enum DeltaValue {

        ADDED, UPDATED, REMOVED

    }

    private static <T> Supplier<T> value(T value) {
        return (value != null) ? () -> value : null;
    }

    private static <T> Supplier<T> lazily(Supplier<T> supplier) {
        Supplier<T> lazySupplier = new Supplier<T>() {

            private T value;

            @Override
            public T get() {
                if (this.value == null) {
                    this.value = supplier.get();
                }
                return this.value;
            }

        };

        return (supplier != null) ? lazySupplier : null;
    }

    /**
     * The {@link Session} to use for {@link LastAccessedTimeIgnoringJdbcIndexedSessionRepository}.
     *
     * @author Vedran Pavic
     */
    final class JdbcSession implements Session {

        private final MapSession delegate;

        private final String primaryKey;

        private boolean isNew;

        private boolean changed;

        private Map<String, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue> delta = new HashMap<>();

        JdbcSession(MapSession delegate, String primaryKey, boolean isNew) {
            this.delegate = delegate;
            this.primaryKey = primaryKey;
            this.isNew = isNew;
            if (this.isNew || (LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.saveMode == SaveMode.ALWAYS)) {
                getAttributeNames().forEach((attributeName) -> this.delta.put(attributeName, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.UPDATED));
            }
        }

        boolean isNew() {
            return this.isNew;
        }

        boolean isChanged() {
            return this.changed;
        }

        Map<String, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue> getDelta() {
            return this.delta;
        }

        void clearChangeFlags() {
            this.isNew = false;
            this.changed = false;
            this.delta.clear();
        }

        Instant getExpiryTime() {
            if (getMaxInactiveInterval().isNegative()) {
                return Instant.ofEpochMilli(Long.MAX_VALUE);
            }
            return getLastAccessedTime().plus(getMaxInactiveInterval());
        }

        @Override
        public String getId() {
            return this.delegate.getId();
        }

        @Override
        public String changeSessionId() {
            this.changed = true;
            String newSessionId = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.sessionIdGenerator.generate();
            this.delegate.setId(newSessionId);
            return newSessionId;
        }

        @Override
        public <T> T getAttribute(String attributeName) {
            Supplier<T> supplier = this.delegate.getAttribute(attributeName);
            if (supplier == null) {
                return null;
            }
            T attributeValue = supplier.get();
            if (attributeValue != null
                    && LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.saveMode.equals(SaveMode.ON_GET_ATTRIBUTE)) {
                this.delta.merge(attributeName, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.UPDATED, (oldDeltaValue,
                                                                                                                          deltaValue) -> (oldDeltaValue == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.ADDED) ? oldDeltaValue : deltaValue);
            }
            return attributeValue;
        }

        @Override
        public Set<String> getAttributeNames() {
            return this.delegate.getAttributeNames();
        }

        @Override
        public void setAttribute(String attributeName, Object attributeValue) {
            boolean attributeExists = (this.delegate.getAttribute(attributeName) != null);
            boolean attributeRemoved = (attributeValue == null);
            if (!attributeExists && attributeRemoved) {
                return;
            }
            if (attributeExists) {
                if (attributeRemoved) {
                    this.delta.merge(attributeName, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.REMOVED,
                            (oldDeltaValue, deltaValue) -> (oldDeltaValue == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.ADDED) ? null : deltaValue);
                }
                else {
                    this.delta.merge(attributeName, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.UPDATED, (oldDeltaValue,
                                                                                                                              deltaValue) -> (oldDeltaValue == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.ADDED) ? oldDeltaValue : deltaValue);
                }
            }
            else {
                this.delta.merge(attributeName, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.ADDED, (oldDeltaValue,
                                                                                                                        deltaValue) -> (oldDeltaValue == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.ADDED) ? oldDeltaValue : LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.UPDATED);
            }
            this.delegate.setAttribute(attributeName, value(attributeValue));
            if (PRINCIPAL_NAME_INDEX_NAME.equals(attributeName) || SPRING_SECURITY_CONTEXT.equals(attributeName)) {
                this.changed = true;
            }
            flushIfRequired();
        }

        @Override
        public void removeAttribute(String attributeName) {
            setAttribute(attributeName, null);
        }

        @Override
        public Instant getCreationTime() {
            return this.delegate.getCreationTime();
        }

        @Override
        public void setLastAccessedTime(Instant lastAccessedTime) {
            this.delegate.setLastAccessedTime(lastAccessedTime);
            //this.changed = true;
            flushIfRequired();
        }

        @Override
        public Instant getLastAccessedTime() {
            return this.delegate.getLastAccessedTime();
        }

        @Override
        public void setMaxInactiveInterval(Duration interval) {
            this.delegate.setMaxInactiveInterval(interval);
            this.changed = true;
            flushIfRequired();
        }

        @Override
        public Duration getMaxInactiveInterval() {
            return this.delegate.getMaxInactiveInterval();
        }

        @Override
        public boolean isExpired() {
            return this.delegate.isExpired();
        }

        private void flushIfRequired() {
            if (LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.flushMode == FlushMode.IMMEDIATE) {
                save();
            }
        }

        private void save() {
            if (this.isNew) {
                LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.transactionOperations.executeWithoutResult((status) -> {
                    Map<String, String> indexes = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.indexResolver
                            .resolveIndexesFor(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this);
                    LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.jdbcOperations
                            .update(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.createSessionQuery, (ps) -> {
                                ps.setString(1, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this.primaryKey);
                                ps.setString(2, getId());
                                ps.setLong(3, getCreationTime().toEpochMilli());
                                ps.setLong(4, getLastAccessedTime().toEpochMilli());
                                ps.setInt(5, (int) getMaxInactiveInterval().getSeconds());
                                ps.setLong(6, getExpiryTime().toEpochMilli());
                                ps.setString(7, indexes.get(PRINCIPAL_NAME_INDEX_NAME));
                            });
                    Set<String> attributeNames = getAttributeNames();
                    if (!attributeNames.isEmpty()) {
                        insertSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this, new ArrayList<>(attributeNames));
                    }
                });
            }
            else {
                LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.transactionOperations.executeWithoutResult((status) -> {
                    if (LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this.changed) {
                        Map<String, String> indexes = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.indexResolver
                                .resolveIndexesFor(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this);
                        LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.jdbcOperations
                                .update(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.this.updateSessionQuery, (ps) -> {
                                    ps.setString(1, getId());
                                    ps.setLong(2, getLastAccessedTime().toEpochMilli());
                                    ps.setInt(3, (int) getMaxInactiveInterval().getSeconds());
                                    ps.setLong(4, getExpiryTime().toEpochMilli());
                                    ps.setString(5, indexes.get(PRINCIPAL_NAME_INDEX_NAME));
                                    ps.setString(6, LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this.primaryKey);
                                });
                    }
                    List<String> addedAttributeNames = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this.delta.entrySet()
                            .stream()
                            .filter((entry) -> entry.getValue() == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.ADDED)
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());
                    if (!addedAttributeNames.isEmpty()) {
                        insertSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this, addedAttributeNames);
                    }
                    List<String> updatedAttributeNames = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this.delta.entrySet()
                            .stream()
                            .filter((entry) -> entry.getValue() == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.UPDATED)
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());
                    if (!updatedAttributeNames.isEmpty()) {
                        updateSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this, updatedAttributeNames);
                    }
                    List<String> removedAttributeNames = LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this.delta.entrySet()
                            .stream()
                            .filter((entry) -> entry.getValue() == LastAccessedTimeIgnoringJdbcIndexedSessionRepository.DeltaValue.REMOVED)
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());
                    if (!removedAttributeNames.isEmpty()) {
                        deleteSessionAttributes(LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession.this, removedAttributeNames);
                    }
                });
            }
            clearChangeFlags();
        }

    }

    private class SessionResultSetExtractor implements ResultSetExtractor<List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession>> {

        @Override
        public List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> extractData(ResultSet rs) throws SQLException, DataAccessException {
            List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> sessions = new ArrayList<>();
            while (rs.next()) {
                String id = rs.getString("SESSION_ID");
                LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession session;
                if (sessions.size() > 0 && getLast(sessions).getId().equals(id)) {
                    session = getLast(sessions);
                }
                else {
                    MapSession delegate = new MapSession(id);
                    String primaryKey = rs.getString("PRIMARY_ID");
                    delegate.setCreationTime(Instant.ofEpochMilli(rs.getLong("CREATION_TIME")));
                    delegate.setLastAccessedTime(Instant.ofEpochMilli(rs.getLong("LAST_ACCESS_TIME")));
                    delegate.setMaxInactiveInterval(Duration.ofSeconds(rs.getInt("MAX_INACTIVE_INTERVAL")));
                    session = new LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession(delegate, primaryKey, false);
                }
                String attributeName = rs.getString("ATTRIBUTE_NAME");
                if (attributeName != null) {
                    byte[] bytes = getLobHandler().getBlobAsBytes(rs, "ATTRIBUTE_BYTES");
                    session.delegate.setAttribute(attributeName, lazily(() -> deserialize(bytes)));
                }
                sessions.add(session);
            }
            return sessions;
        }

        private LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession getLast(List<LastAccessedTimeIgnoringJdbcIndexedSessionRepository.JdbcSession> sessions) {
            return sessions.get(sessions.size() - 1);
        }

    }

}
