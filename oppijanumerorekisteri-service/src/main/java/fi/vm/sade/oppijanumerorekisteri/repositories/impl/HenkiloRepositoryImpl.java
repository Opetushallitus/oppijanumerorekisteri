package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma.yhteystiedotRyhma;
import static fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto.yhteystieto;

@Transactional(propagation = Propagation.MANDATORY)
public class HenkiloRepositoryImpl extends AbstractRepository implements HenkiloHibernateRepository {

    @Override
    public Optional<String> findHetuByOid(String henkiloOid) {
        QHenkilo qHenkilo = henkilo;
        return Optional.ofNullable(jpa().selectFrom(qHenkilo).select(qHenkilo.hetu)
                .where(qHenkilo.oidhenkilo.eq(henkiloOid))
                .fetchOne());
    }

    @Override
    public Optional<String> findOidByHetu(String hetu) {
        QHenkilo qHenkilo = henkilo;
        return Optional.ofNullable(jpa().selectFrom(qHenkilo).select(qHenkilo.oidhenkilo)
                .where(qHenkilo.hetu.eq(hetu))
                .fetchOne());
    }

    @Override
    public List<Henkilo> findHenkiloOidHetuNimisByEtunimetOrSukunimi(List<String> etunimet, String sukunimi) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        JPAQuery<Henkilo> query = jpa().selectFrom(qHenkilo);
        query.select(Projections.bean(Henkilo.class, qHenkilo.oidhenkilo, qHenkilo.etunimet, qHenkilo.kutsumanimi, qHenkilo.sukunimi, qHenkilo.hetu));
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
}
