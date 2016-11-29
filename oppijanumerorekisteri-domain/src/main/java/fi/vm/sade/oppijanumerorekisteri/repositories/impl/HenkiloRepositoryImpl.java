package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Transactional(propagation = Propagation.MANDATORY)
public class HenkiloRepositoryImpl extends AbstractRepository implements HenkiloJpaRepository {

    @Override
    public Optional<String> findHetuByOid(String henkiloOid) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return Optional.ofNullable(jpa().select(qHenkilo.hetu).from(qHenkilo)
                .where(qHenkilo.oidhenkilo.eq(henkiloOid))
                .fetchOne());
    }

    @Override
    public Optional<String> findOidByHetu(String hetu) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        return Optional.ofNullable(jpa().select(qHenkilo.oidhenkilo).from(qHenkilo)
                .where(qHenkilo.hetu.eq(hetu))
                .fetchOne());
    }

    @Override
    public List<Henkilo> findHenkiloOidHetuNimisByEtunimetOrSukunimi(List<String> etunimet, String sukunimi) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        JPAQuery<Henkilo> query = jpa().select(Projections.bean(Henkilo.class, qHenkilo.oidhenkilo, qHenkilo.etunimet,
                qHenkilo.kutsumanimi, qHenkilo.sukunimi, qHenkilo.hetu))
                .from(qHenkilo);
        BooleanBuilder builder = new BooleanBuilder();
        for (String etunimi : etunimet) {
            builder.or(qHenkilo.etunimet.containsIgnoreCase(etunimi));
        }
        builder.and(qHenkilo.sukunimi.containsIgnoreCase(sukunimi));
        query = query.where(builder);
        return query.fetch();
    }

    @Override
    public List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria) {
        return jpa().from(QHenkilo.henkilo)
                .innerJoin(QHenkilo.henkilo.yhteystiedotRyhmas, QYhteystiedotRyhma.yhteystiedotRyhma)
                .innerJoin(QYhteystiedotRyhma.yhteystiedotRyhma.yhteystieto, QYhteystieto.yhteystieto)
                .where(criteria.condition(QHenkilo.henkilo, QYhteystiedotRyhma.yhteystiedotRyhma, QYhteystieto.yhteystieto))
                .select(Projections.bean(YhteystietoHakuDto.class,
                        QHenkilo.henkilo.oidhenkilo.as("henkiloOid"),
                        QYhteystiedotRyhma.yhteystiedotRyhma.ryhmaKuvaus.as("ryhmaKuvaus"),
                        QYhteystiedotRyhma.yhteystiedotRyhma.ryhmaAlkuperaTieto.as("ryhmaAlkuperaTieto"),
                        QYhteystieto.yhteystieto.yhteystietoTyyppi.as("yhteystietoTyyppi"),
                        QYhteystieto.yhteystieto.yhteystietoArvo.as("arvo")
                )).fetch();
    }

    @Override
    public List<Henkilo> findHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit) {
        QHenkilo henkilo = QHenkilo.henkilo;
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
}
