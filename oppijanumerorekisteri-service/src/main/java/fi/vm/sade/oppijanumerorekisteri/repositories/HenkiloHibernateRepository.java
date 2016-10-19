package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;

// High speed repository for jpa queries with querydsl.
@Repository
public interface HenkiloHibernateRepository {
    String findHetuByOid(String henkiloOid);

    String findOidByHetu(String hetu);

    @EntityGraph("henkiloWithKansalaisuusAndAidinkieli")
    List<Henkilo> findHenkiloByEtunimetOrSukunimi(List<String> etunimet, String sukunimi);

}
