package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.NonUniqueResultException;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.SubQueryExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLTemplates;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.dto.KotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijanumerorekisteriCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.querydsl.core.group.GroupBy.groupBy;
import static com.querydsl.core.types.ExpressionUtils.anyOf;
import static com.querydsl.core.types.dsl.Expressions.allOf;
import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toList;

@Repository
public class HenkiloRepositoryImpl implements HenkiloJpaRepository {

    static final float DUPLICATE_QUERY_SIMILARITY_THRESHOLD = 0.5f;

    private final static Logger logger = LoggerFactory.getLogger(HenkiloRepositoryImpl.class);
    private final EntityManager entityManager;

    public HenkiloRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Henkilo.class);
    }

    private JPAQueryFactory jpa() {
        return new JPAQueryFactory(JPQLTemplates.DEFAULT, this.entityManager);
    }

    @Override
    public List<HenkiloHakuDto> findBy(OppijanumerorekisteriCriteria criteria) {
        return this.findBy(criteria, null, null);
    }

    @Override
    public List<HenkiloHakuDto> findBy(OppijanumerorekisteriCriteria criteria, Long limit, Long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<HenkiloHakuDto> query = jpa().from(qHenkilo)
                .select(Projections.constructor(HenkiloHakuDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi
                ));

        this.createQuery(criteria, limit, offset, qHenkilo, query);

        return query.fetch();
    }

    @Override
    public List<Henkilo> findBy(OppijaTuontiCriteria criteria, int limit, int offset, OppijaTuontiSort sort) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        JPAQuery<Henkilo> query = criteria.getQuery(this.entityManager, qHenkilo)
                .limit(limit)
                .offset(offset)
                .select(qHenkilo)
                .distinct();
        if (sort != null) {
            sort.apply(query, qHenkilo);
        }
        return query.fetch();
    }

    @Override
    public List<Henkilo> findOppijoidenTuontiVirheetBy(OppijaTuontiCriteria criteria, int limit, int offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        JPAQuery<?> query = new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .where(qHenkilo.id.in(JPAExpressions.select(qTuontiRivi.henkiloId).from(qTuontiRivi)));

        return criteria.addCriteria(query, qHenkilo)
                .limit(limit)
                .offset(offset)
                .select(qHenkilo)
                .orderBy(new OrderSpecifier<>(Order.DESC, qHenkilo.id))
                .fetch();
    }

    @Override
    public long countBy(OppijaTuontiCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        if (criteria.hasConditions()) {
            return criteria.getQuery(this.entityManager, qHenkilo)
                    .select(qTuontiRivi.henkilo.id)
                    .distinct()
                    .fetchCount();
        }
        // Joining two large tables is expensive (tuonti_rivi and henkilo) without proper conditions
        return new JPAQuery<>(this.entityManager)
                .from(qTuontiRivi)
                .select(qTuontiRivi.henkilo.id)
                .distinct()
                .fetchCount();
    }

    @Override
    public long countOppijoidenTuontiVirheetBy(OppijaTuontiCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        JPAQuery<?> query = new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .where(qHenkilo.id.in(JPAExpressions.select(qTuontiRivi.henkiloId).from(qTuontiRivi)));
        return criteria.addCriteria(query, qHenkilo)
                .select(qHenkilo.id)
                .distinct()
                .fetchCount();
    }

    @Override
    public List<HenkiloHakuPerustietoDto> findPerustietoBy(OppijanumerorekisteriCriteria criteria, Long limit, Long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<HenkiloHakuPerustietoDto> query = jpa().from(qHenkilo)
                .select(Projections.bean(HenkiloHakuPerustietoDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi,
                        qHenkilo.yksiloityVTJ,
                        qHenkilo.yksiloityEidas,
                        qHenkilo.yksiloity,
                        qHenkilo.passivoitu,
                        qHenkilo.duplicate
                ));

        this.createQuery(criteria, limit, offset, qHenkilo, query);

        return query.fetch();
    }

    private void createQuery(OppijanumerorekisteriCriteria criteria, Long limit, Long offset, QHenkilo qHenkilo,
                             JPAQuery<?> query) {
        query.where(criteria.condition(qHenkilo));
        query.orderBy(qHenkilo.sukunimi.asc(), qHenkilo.kutsumanimi.asc());
        if (limit != null) {
            query.limit(limit);
        }
        if (offset != null) {
            query.offset(offset);
        }
    }


    @Override
    public List<HenkiloYhteystietoDto> findWithYhteystiedotBy(HenkiloCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QKielisyys qAsiointikieli = new QKielisyys("asiointikieli");
        QYhteystiedotRyhma qYhteystiedotRyhma = QYhteystiedotRyhma.yhteystiedotRyhma;
        QYhteystieto qYhteystieto = QYhteystieto.yhteystieto;

        JPAQuery<HenkiloYhteystietoDto> query = jpa().from(qHenkilo)
                .leftJoin(qHenkilo.asiointiKieli, qAsiointikieli)
                .leftJoin(qHenkilo.yhteystiedotRyhma, qYhteystiedotRyhma)
                .leftJoin(qYhteystiedotRyhma.yhteystieto, qYhteystieto)
                .select(Projections.constructor(HenkiloYhteystietoDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi,
                        qAsiointikieli.kieliKoodi,
                        qYhteystiedotRyhma.id,
                        qYhteystiedotRyhma.ryhmaKuvaus,
                        qYhteystiedotRyhma.ryhmaAlkuperaTieto,
                        qYhteystiedotRyhma.readOnly,
                        qYhteystieto.yhteystietoTyyppi,
                        qYhteystieto.yhteystietoArvo));

        query.where(criteria.condition(qHenkilo));
        query.orderBy(qHenkilo.sukunimi.asc(), qHenkilo.kutsumanimi.asc());

        return query.fetch();
    }

    @Override
    public Optional<String> findHetuByOid(String henkiloOid) {
        return Optional.ofNullable(jpa().select(henkilo.hetu).from(henkilo)
                .where(henkilo.oidHenkilo.eq(henkiloOid))
                .fetchOne());
    }

    @Override
    public Optional<String> findOidByHetu(String hetu) {
        return Optional.ofNullable(jpa().select(henkilo.oidHenkilo).from(henkilo)
                .where(henkilo.hetu.eq(hetu))
                .fetchOne());
    }

    @Override
    public Optional<String> findOidByKaikkiHetut(String hetu) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qHetu = Expressions.stringPath("kaikkiHetut");
        return Optional.ofNullable(jpa().select(qHenkilo.oidHenkilo).from(qHenkilo)
                .join(qHenkilo.kaikkiHetut, qHetu)
                .where(qHetu.eq(hetu))
                .fetchOne());
    }

    @Override
    public Optional<Henkilo> findMasterBySlaveOid(String henkiloOid) {
        QHenkiloViite qHenkiloViite = QHenkiloViite.henkiloViite;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return Optional.ofNullable(jpa().from(qHenkiloViite, qHenkilo)
                .where(qHenkiloViite.masterOid.eq(qHenkilo.oidHenkilo))
                .where(qHenkiloViite.slaveOid.eq(henkiloOid))
                .select(qHenkilo).fetchFirst());
    }

    @Override
    public Map<String, Henkilo> findMastersBySlaveOids(Set<String> henkiloOids) {
        QHenkiloViite qHenkiloViite = QHenkiloViite.henkiloViite;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return jpa().from(qHenkiloViite, qHenkilo)
                .where(qHenkiloViite.masterOid.eq(qHenkilo.oidHenkilo))
                .where(qHenkiloViite.slaveOid.in(henkiloOids))
                .distinct()
                .transform(groupBy(qHenkiloViite.slaveOid).as(qHenkilo));
    }

    /**
     * @param henkiloOids OIDs of henkilos to query
     * @return Henkilo objects which are either masters for slave oids or just the henkilo record when the oid was a
     * master oid.
     */
    @Override
    public Map<String, Henkilo> findMastersByOids(Set<String> henkiloOids) {
        QHenkiloViite qHenkiloViite = QHenkiloViite.henkiloViite;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        Map<String, String> slaveToMasterOid = new HashMap<>();
        Map<String, Henkilo> res = new HashMap<>();

        jpa().from(qHenkiloViite)
                .where(qHenkiloViite.slaveOid.in(henkiloOids))
                .select(qHenkiloViite.masterOid, qHenkiloViite.slaveOid)
                .fetch()
                .forEach(queryResult -> slaveToMasterOid
                        .put(queryResult.get(qHenkiloViite.slaveOid), queryResult.get(qHenkiloViite.masterOid)));

        Set<String> foundSlaves = slaveToMasterOid.keySet();

        Stream<String> masterOids = henkiloOids
                .stream()
                .filter(oid -> !foundSlaves.contains(oid));

        Set<String> queryOids =
                Stream.concat(masterOids, slaveToMasterOid.values().stream())
                        .collect(Collectors.toSet());

        Map<String, Henkilo> henkilot = jpa().from(qHenkilo)
                .where(qHenkilo.oidHenkilo.in(queryOids))
                .distinct()
                .transform(groupBy(qHenkilo.oidHenkilo).as(qHenkilo));

        henkiloOids.forEach(oid -> {
            String masterOid = henkilot.containsKey(oid) ? oid : slaveToMasterOid.get(oid);
            if (henkilot.containsKey(masterOid)) {
                res.put(oid, henkilot.get(masterOid));
            } else {
                logger.error(String.format("No master henkilo found for oid %s", oid));
            }
        });

        return res;
    }

    @Override
    public List<String> findOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount) {
        JPAQuery<String> query = jpa().from(henkilo).where(criteria.condition(henkilo))
                .where(henkilo.modified.goe(modifiedSince.toDate()))
                .select(henkilo.oidHenkilo)
                .orderBy(henkilo.modified.asc());
        if (offset != null) {
            query.offset(offset);
        }
        if (amount != null) {
            query.limit(amount);
        }
        return query.fetch();
    }

    @Override
    public Optional<Henkilo> findByIdentification(IdentificationDto identification) throws NonUniqueResultException {
        return this.findByIdentification(null, identification);
    }

    @Override
    public Optional<Henkilo> findByIdentification(String oidHenkilo, IdentificationDto identification) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QIdentification qIdentification = QIdentification.identification;

        JPAQuery<Henkilo> query = jpa()
                .from(qHenkilo)
                .join(qHenkilo.identifications, qIdentification)
                .where(qIdentification.idpEntityId.eq(identification.getIdpEntityId()))
                .where(qIdentification.identifier.eq(identification.getIdentifier()))
                .select(qHenkilo);
        if (oidHenkilo != null) {
            query.where(qHenkilo.oidHenkilo.eq(oidHenkilo));
        }
        return Optional.ofNullable(query.fetchOne());
    }

    @Override
    public Collection<Henkilo> findByIdentifications(Collection<IdentificationDto> identifications) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QIdentification qIdentification = QIdentification.identification;

        List<Predicate> predicates = identifications.stream().map(identification ->
                qIdentification.idpEntityId.eq(identification.getIdpEntityId())
                        .and(qIdentification.identifier.eq(identification.getIdentifier()))).collect(toList());

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.identifications, qIdentification)
                .where(anyOf(predicates))
                .select(qHenkilo).distinct().fetch();
    }

    @Override
    public List<Henkilo> findSlavesByMasterOid(String henkiloOid) {
        QHenkilo qMaster = new QHenkilo("master");
        QHenkilo qSlave = new QHenkilo("slave");
        QHenkiloViite qHenkiloViite = QHenkiloViite.henkiloViite;

        return jpa()
                .from(qMaster, qHenkiloViite, qSlave)
                .where(qMaster.oidHenkilo.eq(qHenkiloViite.masterOid))
                .where(qSlave.oidHenkilo.eq(qHenkiloViite.slaveOid))
                .where(qMaster.oidHenkilo.eq(henkiloOid))
                .select(qSlave)
                .fetch();
    }

    @Override
    public int findDuplikaatitCount(HenkiloDuplikaattiCriteria criteria, String masterOid) {
        this.entityManager.createNativeQuery("SET pg_trgm.similarity_threshold = " + DUPLICATE_QUERY_SIMILARITY_THRESHOLD)
                .executeUpdate();
        Query duplicateQuery = this.entityManager.createNativeQuery("SELECT COUNT(*) " +
                        "FROM henkilo " +
                        "WHERE duplicate_search_str % duplicate_search_fmt(:namesAndBirthDate) " +
                        "AND passivoitu = FALSE " +
                        "AND duplicate = FALSE " +
                        "AND oidhenkilo != :masterOid")
                .setParameter("namesAndBirthDate", getNamesAndBirthDate(criteria))
                .setParameter("masterOid", masterOid);
        return ((Number) duplicateQuery.getSingleResult()).intValue();
    }

    // NOTE: native postgres query
    @SuppressWarnings("unchecked")
    @Override
    public List<Henkilo> findDuplikaatit(HenkiloDuplikaattiCriteria criteria) {
        this.entityManager.createNativeQuery("SET pg_trgm.similarity_threshold = " + DUPLICATE_QUERY_SIMILARITY_THRESHOLD)
                .executeUpdate();
        Query henkiloTypedQuery = this.entityManager.createNativeQuery("SELECT * " +
                "FROM henkilo " +
                "WHERE duplicate_search_str % duplicate_search_fmt(:namesAndBirthDate) " +
                "AND passivoitu = FALSE " +
                "AND duplicate = FALSE " +
                "ORDER BY duplicate_search_str <-> duplicate_search_fmt(:namesAndBirthDate) ASC",
                Henkilo.class).setParameter("namesAndBirthDate", getNamesAndBirthDate(criteria));
        return henkiloTypedQuery.getResultList();
    }

    protected static String getNamesAndBirthDate(HenkiloDuplikaattiCriteria criteria) {
        String syntymaaika = criteria.getSyntymaaika() != null
                ? criteria.getSyntymaaika().format(DateTimeFormatter.ISO_LOCAL_DATE) : "";
        return Stream.of(
                    criteria.getEtunimet(),
                    criteria.getKutsumanimi(),
                    criteria.getSukunimi(),
                    syntymaaika)
                .filter(Objects::nonNull)
                .collect(joining(" "));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> findUnidentified(long limit, long offset) {
        Query unidentifiedQuery = entityManager.createNativeQuery("""
                SELECT DISTINCT h.oidhenkilo
                FROM henkilo h
                LEFT JOIN yksilointivirhe yv ON h.id = yv.henkilo_id
                LEFT JOIN yksilointitieto yt ON h.id = yt.henkiloid
                WHERE h.yksiloityvtj = false
                  AND h.hetu IS NOT NULL
                  AND h.hetu != ''
                  AND (yv.id IS NULL OR yv.uudelleenyritys_aikaleima < now())
                  AND yt.id IS NULL
                LIMIT :limit
                OFFSET :offset
        """, String.class)
                .setParameter("limit", limit)
                .setParameter("offset", offset);
        return unidentifiedQuery.getResultList();
    }

    @Override
    public List<String> findOidByYhteystieto(String arvo) {
        QYhteystieto qYhteystieto = QYhteystieto.yhteystieto;
        QYhteystiedotRyhma qYhteystiedotRyhma = QYhteystiedotRyhma.yhteystiedotRyhma;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.yhteystiedotRyhma, qYhteystiedotRyhma)
                .join(qYhteystiedotRyhma.yhteystieto, qYhteystieto)
                .where(qYhteystieto.yhteystietoArvo.eq(arvo))
                .select(qHenkilo.oidHenkilo).distinct().fetch();
    }

    @Override
    public Iterable<String> findPassinumerotByOid(String oid) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qPassinumero = Expressions.stringPath("passinumero");

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.passinumerot, qPassinumero)
                .where(qHenkilo.oidHenkilo.eq(oid))
                .select(qPassinumero)
                .fetch();
    }

    @Override
    public Map<String, Henkilo> findAndMapByKaikkiHetut(Set<String> hetut) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qHetu = Expressions.stringPath("kaikkiHetut");

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.kaikkiHetut, qHetu)
                .where(qHetu.in(hetut))
                .transform(groupBy(qHetu).as(qHenkilo));
    }

    @Override
    public Map<String, Henkilo> findAndMapByPassinumerot(Set<String> passinumerot) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qPassinumero = Expressions.stringPath("passinumero");

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.passinumerot, qPassinumero)
                .where(qPassinumero.in(passinumerot))
                .transform(groupBy(qPassinumero).as(qHenkilo));
    }

    @Override
    public Map<String, Henkilo> findAndMapByIdentifiers(IdpEntityId idpEntityId, Set<String> identifiers) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QIdentification qIdentification = QIdentification.identification;

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.identifications, qIdentification)
                .where(qIdentification.idpEntityId.eq(idpEntityId))
                .where(qIdentification.identifier.in(identifiers))
                .transform(groupBy(qIdentification.identifier).as(qHenkilo));
    }

    @Override
    public long countByYksilointiOnnistuneet(OppijaTuontiCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        QHenkilo subQHenkilo = new QHenkilo("subQHenkilo");
        SubQueryExpression<Long> subQuery = JPAExpressions.select(subQHenkilo.id).from(subQHenkilo).where(allOf(
                subQHenkilo.duplicate.isFalse(),
                subQHenkilo.passivoitu.isFalse(),
                subQHenkilo.yksiloity.isFalse(),
                subQHenkilo.yksiloityVTJ.isFalse(),
                subQHenkilo.yksiloityEidas.isFalse())
        );
        if (criteria.hasConditions()) {
            return criteria.getQuery(this.entityManager, qHenkilo).where(qTuontiRivi.henkilo.id.notIn(subQuery))
                    .select(qTuontiRivi.henkilo.id).distinct().fetchCount();
        }
        // We don't need to join two large tables this way without proper conditions
        return new JPAQuery<>(this.entityManager)
                .from(qTuontiRivi)
                .where(qTuontiRivi.henkilo.id.notIn(subQuery)).select(qTuontiRivi.henkilo.id).distinct().fetchCount();
    }

    @Override
    public long countByYksilointiVirheet(OppijaTuontiCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        return criteria.getQuery(entityManager, qHenkilo)
                .where(qHenkilo.duplicate.isFalse(), qHenkilo.passivoitu.isFalse())
                .where(anyOf(
                        allOf(
                                qHenkilo.hetu.isNull(),
                                qHenkilo.yksiloity.isFalse(),
                                qHenkilo.yksiloityVTJ.isFalse(),
                                qHenkilo.yksiloityEidas.isFalse()
                        ),
                        allOf(
                                qHenkilo.hetu.isNotNull(),
                                qHenkilo.yksiloity.isFalse(),
                                qHenkilo.yksiloityVTJ.isFalse(),
                                qHenkilo.yksiloityEidas.isFalse(),
                                qHenkilo.yksilointiYritetty.isTrue()
                        )
                )).select(qTuontiRivi.henkilo.id).distinct().fetchCount();
    }

    @Override
    public long countByYksilointiKeskeneraiset(OppijaTuontiCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        return criteria.getQuery(entityManager, qHenkilo)
                .where(allOf(
                        qHenkilo.duplicate.isFalse(),
                        qHenkilo.passivoitu.isFalse(),
                        qHenkilo.hetu.isNotNull(),
                        qHenkilo.yksiloity.isFalse(),
                        qHenkilo.yksiloityVTJ.isFalse(),
                        qHenkilo.yksiloityEidas.isFalse(),
                        qHenkilo.yksilointiYritetty.isFalse()
                )).select(qTuontiRivi.henkilo.id).distinct().fetchCount();
    }

    @Override
    public Optional<Henkilo> findByKaikkiHetut(String hetu) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath kaikkiHetutPath = Expressions.stringPath("kaikkiHetut");

        return Optional.ofNullable(jpa()
                .from(qHenkilo)
                .join(qHenkilo.kaikkiHetut, kaikkiHetutPath)
                .where(kaikkiHetutPath.eq(hetu))
                .select(qHenkilo)
                .fetchOne());
    }

    @Override
    public List<HenkiloMunicipalDobDto> findByMunicipalAndBirthdate(final String municipal, final LocalDate dob, final long limit, final long offset) {
        JPAQuery<HenkiloMunicipalDobDto> query = jpa().from(henkilo)
                .select(Projections.constructor(HenkiloMunicipalDobDto.class,
                        henkilo.oidHenkilo,
                        henkilo.hetu,
                        henkilo.etunimet,
                        henkilo.kutsumanimi,
                        henkilo.sukunimi,
                        henkilo.syntymaaika
                ));

        query.where(henkilo.kotikunta.eq(municipal)
                .and(henkilo.syntymaaika.goe(dob)));

        query.orderBy(henkilo.id.asc());

        query.limit(limit);
        query.offset(offset);

        return query.fetch();
    }

    @Override
    @Transactional
    public Collection<Henkilo> findDeadWithIncompleteCleanup(CleanupStep step) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return jpa()
                .from(qHenkilo)
                .where(
                        qHenkilo.kuolinpaiva.before(LocalDate.now()),
                        qHenkilo.cleanupStep.isNull().or(qHenkilo.cleanupStep.ne(step))
                )
                .select(qHenkilo)
                .fetch();
    }

    @Override
    public List<String> findHetusInVtjBucket(long bucketId) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return jpa()
                .from(qHenkilo)
                .where(qHenkilo.vtjBucket.eq(bucketId), qHenkilo.passivoitu.isFalse(), qHenkilo.hetu.isNotNull(), qHenkilo.yksiloityVTJ.isTrue(), qHenkilo.yksiloityEidas.isFalse())
                .select(qHenkilo.hetu)
                .fetch();
    }

    @Override
    public List<String> findHetusWithoutVtjBucket() {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return jpa()
                .from(qHenkilo)
                .where(qHenkilo.vtjBucket.isNull(), qHenkilo.passivoitu.isFalse(), qHenkilo.hetu.isNotNull(), qHenkilo.yksiloityVTJ.isTrue(), qHenkilo.yksiloityEidas.isFalse())
                .select(qHenkilo.hetu)
                .fetch();
    }

    @Override
    public List<KotikuntaHistoria> findKotikuntaHistorias(List<String> oids) {
        return findKotikuntaHistorias(oids, false);
    }

    @Override
    public List<KotikuntaHistoria> findTurvakieltoKotikuntaHistorias(List<String> oids) {
        return findKotikuntaHistorias(oids, true);
    }

    private List<KotikuntaHistoria> findKotikuntaHistorias(List<String> oids, boolean turvakielto) {
        Query kotikuntaQuery = this.entityManager.createNativeQuery("""
                        SELECT h.oidhenkilo, kh.kotikunta, kh.kuntaan_muuttopv, kh.kunnasta_pois_muuttopv
                        FROM henkilo h LEFT JOIN kotikunta_historia kh ON h.id = kh.henkilo_id
                        WHERE h.oidhenkilo IN :oids AND kh.kotikunta IS NOT NULL AND h.turvakielto = :turvakielto
                        ORDER BY kh.kuntaan_muuttopv, kh.id
                """, KotikuntaHistoria.class)
                .setParameter("oids", oids)
                .setParameter("turvakielto", turvakielto);
        return kotikuntaQuery.getResultList();
    }
}
