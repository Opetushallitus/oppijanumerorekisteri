package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.SubQueryExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijanumerorekisteriCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.querydsl.core.group.GroupBy.groupBy;
import static com.querydsl.core.group.GroupBy.list;
import static com.querydsl.core.types.ExpressionUtils.anyOf;
import static com.querydsl.core.types.dsl.Expressions.allOf;
import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.models.QKansalaisuus.kansalaisuus;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma.yhteystiedotRyhma;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto.yhteystieto;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toList;

@Repository
public class HenkiloRepositoryImpl implements HenkiloJpaRepository {

    static final float DUPLICATE_QUERY_SIMILARITY_THRESHOLD = 0.4f;

    private final static Logger logger = LoggerFactory.getLogger(HenkiloRepositoryImpl.class);
    private final EntityManager entityManager;

    public HenkiloRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Henkilo.class);
    }

    private JPAQueryFactory jpa() {
        return new JPAQueryFactory(this.entityManager);
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
    public List<HenkiloHakuPerustietoDto> findPerustietoBy(OppijanumerorekisteriCriteria criteria, Long limit, Long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<HenkiloHakuPerustietoDto> query = jpa().from(qHenkilo)
                .select(Projections.constructor(HenkiloHakuPerustietoDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi,
                        qHenkilo.yksiloityVTJ,
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
    public List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria) {
        return jpa().from(henkilo)
                .innerJoin(henkilo.yhteystiedotRyhma, yhteystiedotRyhma)
                .innerJoin(yhteystiedotRyhma.yhteystieto, yhteystieto)
                .where(criteria.condition(henkilo, yhteystiedotRyhma, yhteystieto))
                .select(Projections.bean(YhteystietoHakuDto.class,
                        henkilo.oidHenkilo.as("henkiloOid"),
                        yhteystiedotRyhma.ryhmaKuvaus.as("ryhmaKuvaus"),
                        yhteystiedotRyhma.ryhmaAlkuperaTieto.as("ryhmaAlkuperaTieto"),
                        yhteystiedotRyhma.readOnly.as("readOnly"),
                        yhteystieto.yhteystietoTyyppi.as("yhteystietoTyyppi"),
                        yhteystieto.yhteystietoArvo.as("arvo")
                )).fetch();
    }

    @Override
    public List<Henkilo> findHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit) {
        JPAQuery<Henkilo> query = jpa()
                .select(Projections.bean(Henkilo.class,
                        henkilo.oidHenkilo,
                        henkilo.hetu,
                        henkilo.vtjsynced)
                )
                .from(henkilo);

        // always select all identities that have never been synced. also, select those that have been synced earlier
        // than syncedBeforeTimestamp (if given, otherwise select everything)
        BooleanBuilder builder = new BooleanBuilder();
        builder.or(henkilo.vtjsynced.isNull());
        if (syncedBeforeTimestamp != null) {
            builder.or(henkilo.vtjsynced.before(new Date(syncedBeforeTimestamp)));
        } else {
            builder.or(henkilo.vtjsynced.isNotNull());
        }
        query = query.where(builder);

        // paginate
        query = query.offset(offset).limit(limit);

        // sort
        query = query.orderBy(henkilo.vtjsynced.asc());

        return query.fetch();
    }

    @Override
    public List<HenkiloPerustietoDto> findByOidIn(List<String> oidList) {
        List<HenkiloPerustietoDto> henkiloDtoList = jpa().from(henkilo)
                .select(Projections.bean(HenkiloPerustietoDto.class, henkilo.oidHenkilo, henkilo.hetu, henkilo.etunimet,
                        henkilo.kutsumanimi, henkilo.sukunimi, henkilo.syntymaaika, henkilo.turvakielto, henkilo.kasittelijaOid, henkilo.sukupuoli, henkilo.modified))
                .where(henkilo.oidHenkilo.in(oidList)).fetch();

        Map<String, KielisyysDto> stringAsiointikieliMap = jpa().from(henkilo)
                .select(henkilo.oidHenkilo, Projections.bean(KielisyysDto.class,
                        henkilo.asiointiKieli.kieliKoodi, henkilo.asiointiKieli.kieliTyyppi))
                .where(henkilo.oidHenkilo.in(oidList))
                .fetch().stream().collect(Collectors.toMap(tuple ->
                        tuple.get(0, String.class), tuple -> tuple.get(1, KielisyysDto.class)));

        Map<String, KielisyysDto> stringAidinkieliMap = jpa().from(henkilo)
                .select(henkilo.oidHenkilo, Projections.bean(KielisyysDto.class,
                        henkilo.aidinkieli.kieliKoodi, henkilo.aidinkieli.kieliTyyppi))
                .where(henkilo.oidHenkilo.in(oidList))
                .fetch().stream().collect(Collectors.toMap(tuple ->
                        tuple.get(0, String.class), tuple -> tuple.get(1, KielisyysDto.class)));

        Map<String, List<KansalaisuusDto>> stringKansalaisuusMap = jpa().from(henkilo)
                .innerJoin(henkilo.kansalaisuus, kansalaisuus)
                .where(henkilo.oidHenkilo.in(oidList))
                .transform(groupBy(henkilo.oidHenkilo).as(list(Projections.bean(KansalaisuusDto.class, kansalaisuus.kansalaisuusKoodi))));

        henkiloDtoList.forEach(henkiloDto -> {
            henkiloDto.setAsiointiKieli(stringAsiointikieliMap.get(henkiloDto.getOidHenkilo()));
            henkiloDto.setAidinkieli(stringAidinkieliMap.get(henkiloDto.getOidHenkilo()));
            if (stringKansalaisuusMap.get(henkiloDto.getOidHenkilo()) != null) {
                henkiloDto.setKansalaisuus(new HashSet<>(stringKansalaisuusMap.get(henkiloDto.getOidHenkilo())));
            }
        });
        return henkiloDtoList;
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
    public Optional<Henkilo> findByExternalId(String externalId) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QExternalId qExternalId = QExternalId.externalId;

        return Optional.ofNullable(jpa()
                .from(qHenkilo)
                .join(qHenkilo.externalIds, qExternalId)
                .where(qExternalId.externalid.eq(externalId))
                .select(qHenkilo).fetchOne());
    }

    @Override
    public Collection<Henkilo> findByExternalIds(Collection<String> externalIds) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QExternalId qExternalId = QExternalId.externalId;

        return jpa()
                .from(qHenkilo)
                .join(qHenkilo.externalIds, qExternalId)
                .where(qExternalId.externalid.in(externalIds))
                .select(qHenkilo).distinct().fetch();
    }

    @Override
    public Optional<Henkilo> findByIdentification(IdentificationDto identification) {
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
    public Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByHetu(String hetu) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return Optional.ofNullable(jpa().from(qHenkilo).where(qHenkilo.hetu.eq(hetu))
                .select(Projections.bean(HenkiloOidHetuNimiDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi))
                .fetchOne());
    }

    @Override
    public Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByKaikkiHetut(String hetu) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qHetu = Expressions.stringPath("kaikkiHetut");

        return Optional.ofNullable(jpa().from(qHenkilo)
                .join(qHenkilo.kaikkiHetut, qHetu).where(qHetu.eq(hetu))
                .select(Projections.bean(HenkiloOidHetuNimiDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi))
                .fetchOne());
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

    // NOTE: native postgres query
    @SuppressWarnings("unchecked")
    @Override
    public List<Henkilo> findDuplikaatit(HenkiloDuplikaattiCriteria criteria) {
        this.entityManager.createNativeQuery("SET pg_trgm.similarity_threshold = " + DUPLICATE_QUERY_SIMILARITY_THRESHOLD)
                .executeUpdate();
        Query henkiloTypedQuery = this.entityManager.createNativeQuery("SELECT " +
                "h1.* \n" +
                "FROM henkilo AS h1 \n" +
                "WHERE (h1.etunimet || ' ' || h1.kutsumanimi || ' ' || h1.sukunimi || ' ' || date_to_char(h1.syntymaaika)) % :namesAndBirthDate \n" +
                "  AND h1.passivoitu = FALSE \n" +
                "  AND h1.duplicate = FALSE \n" +
                "ORDER BY (h1.etunimet || ' ' || h1.kutsumanimi || ' ' || h1.sukunimi || ' ' || date_to_char(h1.syntymaaika)) <-> :namesAndBirthDate ASC \n",
                Henkilo.class).setParameter("namesAndBirthDate", getNamesAndBirthDate(criteria));
        long currentTimeMsBefore = System.currentTimeMillis();
        List<Henkilo> results = henkiloTypedQuery.getResultList();
        long durationMs = System.currentTimeMillis() - currentTimeMsBefore;
        logger.info("Query time for findDuplikaatit: {} milliseconds", durationMs);
        return results;
    }

    private String getNamesAndBirthDate(HenkiloDuplikaattiCriteria criteria) {
        String syntymaaika = criteria.getSyntymaaika() != null
                ? criteria.getSyntymaaika().format(DateTimeFormatter.BASIC_ISO_DATE) : "";
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
    public Collection<Henkilo> findUnidentified(long limit, long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return jpa()
                .from(qHenkilo)
                .where(
                        qHenkilo.yksiloityVTJ.eq(false),
                        qHenkilo.hetu.isNotNull(),
                        qHenkilo.hetu.ne("")
                ).offset(offset)
                .limit(limit)
                .select(qHenkilo)
                .fetch();
    }

    @Override
    public Iterable<String> findOidByYhteystieto(String arvo) {
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
    public Map<String, Henkilo> findAndMapByIdentifiers(String idpEntityId, Set<String> identifiers) {
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
                subQHenkilo.yksiloityVTJ.isFalse())
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
                                qHenkilo.yksiloityVTJ.isFalse()
                        ),
                        allOf(
                                qHenkilo.hetu.isNotNull(),
                                qHenkilo.yksiloity.isFalse(),
                                qHenkilo.yksiloityVTJ.isFalse(),
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
                        qHenkilo.yksilointiYritetty.isFalse()
                )).select(qTuontiRivi.henkilo.id).distinct().fetchCount();
    }

    @Override
    public List<HenkiloPerustietoDto> findPerustiedotByHetuIn(List<String> hetuList) {
        List<HenkiloPerustietoDto> henkiloDtoList = jpa().from(henkilo)
                .select(Projections.bean(HenkiloPerustietoDto.class, henkilo.oidHenkilo, henkilo.hetu, henkilo.etunimet,
                        henkilo.kutsumanimi, henkilo.sukunimi, henkilo.syntymaaika, henkilo.turvakielto, henkilo.kasittelijaOid, henkilo.sukupuoli, henkilo.modified))
                .where(henkilo.hetu.in(hetuList)).fetch();

        Map<String, KielisyysDto> stringAsiointikieliMap = jpa().from(henkilo)
                .select(henkilo.hetu, Projections.bean(KielisyysDto.class,
                        henkilo.asiointiKieli.kieliKoodi, henkilo.asiointiKieli.kieliTyyppi))
                .where(henkilo.hetu.in(hetuList))
                .fetch().stream().collect(Collectors.toMap(tuple ->
                        tuple.get(0, String.class), tuple -> tuple.get(1, KielisyysDto.class)));

        Map<String, KielisyysDto> stringAidinkieliMap = jpa().from(henkilo)
                .select(henkilo.hetu, Projections.bean(KielisyysDto.class,
                        henkilo.aidinkieli.kieliKoodi, henkilo.aidinkieli.kieliTyyppi))
                .where(henkilo.hetu.in(hetuList))
                .fetch().stream().collect(Collectors.toMap(tuple ->
                        tuple.get(0, String.class), tuple -> tuple.get(1, KielisyysDto.class)));

        Map<String, List<KansalaisuusDto>> stringKansalaisuusMap = jpa().from(henkilo)
                .innerJoin(henkilo.kansalaisuus, kansalaisuus)
                .where(henkilo.hetu.in(hetuList))
                .transform(groupBy(henkilo.hetu).as(list(Projections.bean(KansalaisuusDto.class, kansalaisuus.kansalaisuusKoodi))));

        henkiloDtoList.forEach(henkiloDto -> {
            henkiloDto.setAsiointiKieli(stringAsiointikieliMap.get(henkiloDto.getHetu()));
            henkiloDto.setAidinkieli(stringAidinkieliMap.get(henkiloDto.getHetu()));
            if (stringKansalaisuusMap.get(henkiloDto.getHetu()) != null) {
                henkiloDto.setKansalaisuus(new HashSet<>(stringKansalaisuusMap.get(henkiloDto.getHetu())));
            }
        });
        return henkiloDtoList;
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
}
