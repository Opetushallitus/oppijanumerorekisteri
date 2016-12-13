package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.transform.AliasToBeanResultTransformer;
import org.hibernate.type.StringType;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.models.QKansalaisuus.kansalaisuus;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma.yhteystiedotRyhma;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto.yhteystieto;

@Transactional(propagation = Propagation.MANDATORY)
public class HenkiloRepositoryImpl extends AbstractRepository implements HenkiloJpaRepository {

    @Override
    public Optional<String> findHetuByOid(String henkiloOid) {
        return Optional.ofNullable(jpa().select(henkilo.hetu).from(henkilo)
                .where(henkilo.oidhenkilo.eq(henkiloOid))
                .fetchOne());
    }

    @Override
    public Optional<String> findOidByHetu(String hetu) {
        return Optional.ofNullable(jpa().select(henkilo.oidhenkilo).from(henkilo)
                .where(henkilo.hetu.eq(hetu))
                .fetchOne());
    }

    @Override
    public List<Henkilo> findHenkiloOidHetuNimisByEtunimetOrSukunimi(List<String> etunimet, String sukunimi) {
        JPAQuery<Henkilo> query = jpa().select(Projections.bean(Henkilo.class, henkilo.oidhenkilo, henkilo.etunimet,
                henkilo.kutsumanimi, henkilo.sukunimi, henkilo.hetu))
                .from(henkilo);
        BooleanBuilder builder = new BooleanBuilder();
        for (String etunimi : etunimet) {
            builder.or(henkilo.etunimet.containsIgnoreCase(etunimi));
        }
        builder.and(henkilo.sukunimi.containsIgnoreCase(sukunimi));
        query = query.where(builder);
        return query.fetch();
    }

    @Override
    public List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria) {
        return jpa().from(henkilo)
                .innerJoin(henkilo.yhteystiedotRyhmas, yhteystiedotRyhma)
                .innerJoin(yhteystiedotRyhma.yhteystieto, yhteystieto)
                .where(criteria.condition(henkilo, yhteystiedotRyhma, yhteystieto))
                .select(Projections.bean(YhteystietoHakuDto.class,
                        henkilo.oidhenkilo.as("henkiloOid"),
                        yhteystiedotRyhma.ryhmaKuvaus.as("ryhmaKuvaus"),
                        yhteystiedotRyhma.ryhmaAlkuperaTieto.as("ryhmaAlkuperaTieto"),
                        yhteystieto.yhteystietoTyyppi.as("yhteystietoTyyppi"),
                        yhteystieto.yhteystietoArvo.as("arvo")
                )).fetch();
    }

    @Override
    public List<Henkilo> findHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit) {
        JPAQuery<Henkilo> query = jpa()
            .select(Projections.bean(Henkilo.class,
                henkilo.oidhenkilo,
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
                .select(Projections.bean(HenkiloPerustietoDto.class, henkilo.oidhenkilo, henkilo.hetu, henkilo.etunimet,
                        henkilo.kutsumanimi,henkilo.sukunimi, henkilo.henkilotyyppi, henkilo.kasittelijaOid, henkilo.sukupuoli))
                .where(henkilo.oidhenkilo.in(oidList)).fetch();

        Map<String, KielisyysDto> stringAsiointikieliMap = jpa().from(henkilo)
                .select(henkilo.oidhenkilo, Projections.bean(KielisyysDto.class,
                        henkilo.asiointikieli.kielikoodi, henkilo.asiointikieli.kielityyppi))
                .where(henkilo.oidhenkilo.in(oidList))
                .fetch().stream().collect(Collectors.toMap(tuple ->
                        tuple.get(0, String.class), tuple -> tuple.get(1, KielisyysDto.class)));

        Map<String, KielisyysDto> stringAidinkieliMap = jpa().from(henkilo)
                .select(henkilo.oidhenkilo, Projections.bean(KielisyysDto.class,
                        henkilo.aidinkieli.kielikoodi, henkilo.aidinkieli.kielityyppi))
                .where(henkilo.oidhenkilo.in(oidList))
                .fetch().stream().collect(Collectors.toMap(tuple ->
                        tuple.get(0, String.class), tuple -> tuple.get(1, KielisyysDto.class)));

        List<Tuple> kansaTuples = jpa().from(henkilo)
                .innerJoin(henkilo.kansalaisuus, kansalaisuus)
                .select(henkilo.oidhenkilo, Projections.list(Projections.bean(KansalaisuusDto.class,
                        kansalaisuus.kansalaisuuskoodi)))
                .where(henkilo.oidhenkilo.in(oidList))
                .fetch();
        @SuppressWarnings("unchecked")
        Map<String, List<KansalaisuusDto>> stringKansalaisuusMap = kansaTuples.stream()
                .collect(Collectors.toMap(tuple ->
                         tuple.get(0, String.class), tuple -> tuple.get(1, List.class)));

        henkiloDtoList.forEach(henkiloDto -> {
            henkiloDto.setAsiointikieli(stringAsiointikieliMap.get(henkiloDto.getOidhenkilo()));
            henkiloDto.setAidinkieli(stringAidinkieliMap.get(henkiloDto.getOidhenkilo()));
            if(stringKansalaisuusMap.get(henkiloDto.getOidhenkilo()) != null) {
                henkiloDto.setKansalaisuus(stringKansalaisuusMap.get(henkiloDto.getOidhenkilo()).stream().collect(Collectors.toSet()));
            }
        });
        return henkiloDtoList;
    }

    @Override
    public List<HenkiloViiteDto> findHenkiloViitteesByHenkilo(HenkiloCriteria query) {
        Where where = buildSqlConditions(query, "h");
        SQLQuery q = em.unwrap(Session.class)
            .createSQLQuery("WITH RECURSIVE hierarchy(root, masterOid, slaveOid) AS (\n" +
                    "    WITH RECURSIVE masters(depth, masterOid, slaveOid) AS (\n" +
                    "        -- select matching henkilos with viittees to any direction\n" +
                    "        SELECT 0 as depth,\n" +
                    "               v.master_oid as masterOid,\n" +
                    "               v.slave_oid as slaveOid\n" +
                    "        FROM henkilo h INNER JOIN henkiloviite v ON v.master_oid = h.oidhenkilo\n" +
                    "              OR v.slave_oid = h.oidhenkilo\n" +
                    "        " + where + "\n" +
                    "        -- and union to their masters...\n" +
                    "        UNION ALL SELECT h.depth+1 as depth,\n" +
                    "                          v.master_oid as masterOid,\n" +
                    "                          v.slave_oid as slaveOid\n" +
                    "           FROM masters h INNER JOIN henkiloviite v ON h.masterOid = v.slave_oid\n" +
                    "          WHERE h.depth < 20 -- prevent infinite loops if present in db\n" +
                    "    ) -- selecting the masters that...\n" +
                    "    SELECT DISTINCT true as root, m.masterOid, m.slaveOid FROM masters m\n" +
                    "      -- do not have any more masters themselves:\n" +
                    "      WHERE NOT EXISTS(SELECT m2.* FROM henkiloviite m2 WHERE m2.slave_oid = m.masterOid)\n" +
                    "    -- ...and then to the slave direction all the way down:\n" +
                    "    UNION ALL SELECT false as root,\n" +
                    "                v.master_oid as masterOid, \n" +
                    "                v.slave_oid as slaveOid\n" +
                    "    FROM hierarchy h, henkiloviite v \n" +
                    "        WHERE (-- cause we possibly have one matching branch, allow navigation to different one from root\n" +
                    "             (h.masterOid = v.master_oid AND h.slaveOid != v.slave_oid AND h.root))\n" +
                    "        OR (h.slaveOid = v.master_oid)\n" +
                    ") SELECT DISTINCT hierarchy.masterOid as \"masterOid\", \n" +
                    "        hierarchy.slaveOid as \"henkiloOid\"\n" +
                    " FROM hierarchy \n" +
                    "  ORDER BY hierarchy.masterOid, hierarchy.slaveOid ");
        q.setResultTransformer(new AliasToBeanResultTransformer(HenkiloViiteDto.class));
        return (List<HenkiloViiteDto>) where.apply(q).list();
    }
    
    private Where buildSqlConditions(HenkiloCriteria query, String h) {
        Where where = new Where();
        if (query.getHenkiloOids() != null) {
            if (query.getHenkiloOids().isEmpty()) {
                where.conditions.add("(TRUE = FALSE)"); // Hibernate does not support Postgre's plain FALSE
            } else {
                where.conditions.add(h+".oidhenkilo in (:oids)");
                where.parameterSetters.add(q -> q.setParameterList("oids", query.getHenkiloOids(), StringType.INSTANCE));
            }
        }
        if (query.getModifiedSince() != null) {
            where.conditions.add("("+h+".created >= :modifiedSince OR "+h+".modified >= :modifiedSince)");
            where.parameterSetters.add(q -> q.setTimestamp("modifiedSince", query.getModifiedSince().toDate()));
        }
        return where;
    }
}
