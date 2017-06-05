package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import static com.querydsl.core.group.GroupBy.groupBy;
import static com.querydsl.core.group.GroupBy.list;
import static com.querydsl.core.types.ExpressionUtils.anyOf;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloYhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QExternalId;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.joda.time.DateTime;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QIdentification;
import static fi.vm.sade.oppijanumerorekisteri.models.QKansalaisuus.kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma.yhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto.yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaCriteria;
import java.util.Collection;
import static java.util.stream.Collectors.toList;

@Transactional(propagation = Propagation.MANDATORY)
public class HenkiloRepositoryImpl extends AbstractRepository implements HenkiloJpaRepository {

    @Override
    public List<HenkiloHakuDto> findBy(HenkiloCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<HenkiloHakuDto> query = jpa().from(qHenkilo)
                .select(Projections.constructor(HenkiloHakuDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi
        ));

        query.where(criteria.condition(qHenkilo));
        query.orderBy(qHenkilo.sukunimi.asc(), qHenkilo.kutsumanimi.asc());

        return query.fetch();
    }

    @Override
    public List<HenkiloHakuDto> findBy(HenkiloCriteria criteria, long limit, long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<HenkiloHakuDto> query = jpa().from(qHenkilo)
                .select(Projections.constructor(HenkiloHakuDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi,
                        qHenkilo.yksiloity,
                        qHenkilo.yksiloityVTJ
        ));

        query.where(criteria.condition(qHenkilo));
        query.orderBy(qHenkilo.sukunimi.asc(), qHenkilo.kutsumanimi.asc());
        query.limit(limit);
        query.offset(offset);

        return query.fetch();
    }

    @Override
    public List<HenkiloHakuDto> findBy(OppijaCriteria criteria, long limit, long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<HenkiloHakuDto> query = jpa().from(qHenkilo)
                .select(Projections.constructor(HenkiloHakuDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi
                ));

        query.where(criteria.condition(qHenkilo));
        query.orderBy(qHenkilo.sukunimi.asc(), qHenkilo.kutsumanimi.asc());
        query.limit(limit);
        query.offset(offset);

        return query.fetch();
    }

    @Override
    public List<HenkiloYhteystietoDto> findWithYhteystiedotBy(HenkiloCriteria criteria) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QYhteystiedotRyhma qYhteystiedotRyhma = QYhteystiedotRyhma.yhteystiedotRyhma;
        QYhteystieto qYhteystieto = QYhteystieto.yhteystieto;

        JPAQuery<HenkiloYhteystietoDto> query = jpa().from(qHenkilo)
                .leftJoin(qHenkilo.yhteystiedotRyhma, qYhteystiedotRyhma)
                .leftJoin(qYhteystiedotRyhma.yhteystieto, qYhteystieto)
                .select(Projections.constructor(HenkiloYhteystietoDto.class,
                        qHenkilo.oidHenkilo,
                        qHenkilo.hetu,
                        qHenkilo.etunimet,
                        qHenkilo.kutsumanimi,
                        qHenkilo.sukunimi,
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
    public List<Henkilo> findHenkiloOidHetuNimisByEtunimetOrSukunimi(List<String> etunimet, String sukunimi) {
        JPAQuery<Henkilo> query = jpa().select(Projections.bean(Henkilo.class, henkilo.oidHenkilo, henkilo.etunimet,
                henkilo.kutsumanimi, henkilo.sukunimi, henkilo.hetu))
                .from(henkilo);
        BooleanBuilder builder = new BooleanBuilder();
        etunimet.forEach(etunimi -> builder.or(henkilo.etunimet.containsIgnoreCase(etunimi)));

        builder.and(henkilo.sukunimi.containsIgnoreCase(sukunimi));
        query = query.where(builder);
        return query.fetch();
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
                        henkilo.kutsumanimi,henkilo.sukunimi, henkilo.syntymaaika, henkilo.henkiloTyyppi, henkilo.kasittelijaOid, henkilo.sukupuoli, henkilo.modified))
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
                henkiloDto.setKansalaisuus(stringKansalaisuusMap.get(henkiloDto.getOidHenkilo()).stream().collect(Collectors.toSet()));
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
    public List<String> findOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount) {
        JPAQuery<String> query = jpa().from(henkilo).where(criteria.condition(henkilo))
                    .where(henkilo.modified.goe(modifiedSince.toDate()))
                .select(henkilo.oidHenkilo)
                .orderBy(henkilo.modified.asc());
        if(offset != null) {
            query.offset(offset);
        }
        if(amount != null) {
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
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QIdentification qIdentification = QIdentification.identification;

        return Optional.ofNullable(jpa()
                .from(qHenkilo)
                .join(qHenkilo.identifications, qIdentification)
                .where(qIdentification.idpEntityId.eq(identification.getIdpEntityId()))
                .where(qIdentification.identifier.eq(identification.getIdentifier()))
                .select(qHenkilo).fetchOne());
    }

    @Override
    public Collection<Henkilo> findByIdentifications(Collection<IdentificationDto> identifications) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QIdentification qIdentification = QIdentification.identification;

        List<Predicate> predicates = identifications.stream().map(identification -> {
            return qIdentification.idpEntityId.eq(identification.getIdpEntityId())
                    .and(qIdentification.identifier.eq(identification.getIdentifier()));
        }).collect(toList());

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
    public Collection<Henkilo> findUnidentified(long limit, long offset) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return jpa()
                .from(qHenkilo)
                .where(
                        qHenkilo.yksiloityVTJ.eq(false),
                        qHenkilo.hetu.isNotNull(),
                        qHenkilo.hetu.ne("")
                ).offset(offset).limit(limit).select(qHenkilo).distinct().fetch();
    }

}
