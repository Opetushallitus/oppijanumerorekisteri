package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface HenkiloRepository extends QuerydslPredicateExecutor<Henkilo>, JpaRepository<Henkilo, Long>, HenkiloJpaRepository {
    String eagerHenkiloSelect = "select distinct h from Henkilo h " +
           "left join fetch h.aidinkieli " +
           "left join fetch h.asiointiKieli " +
           "left join fetch h.kansalaisuus " +
           "left join fetch h.identifications ";

    @EntityGraph("henkiloDto")
    List<Henkilo> findByOidHenkiloIsIn(Collection<String> oidHenkilo);

    Optional<Henkilo> findByOidHenkilo(String henkiloOid);

    Optional<Henkilo> findByHetu(String hetu);

    List<Henkilo> findByHetuIn(Set<String> hetut);

    @Query(eagerHenkiloSelect + "where (h.hetu in :hetut)")
    List<Henkilo> eagerFindByHetuIn(Set<String> hetut);

    @Query(eagerHenkiloSelect + "where (h.oidHenkilo in :oids)")
    List<Henkilo> eagerFindByOidHenkiloIn(Set<String> oids);

    @Query("select h from Henkilo h left join h.eidasTunnisteet e where e.tunniste = :eidasTunniste")
    Optional<Henkilo> findByEidasTunniste(String eidasTunniste);

    @Query("""
        select h from Henkilo h
        where h.etunimet ilike :query%
           or h.kutsumanimi ilike :query%
           or h.sukunimi ilike :query%""")
    Page<Henkilo> findAllByOppijahakuQuery(String query, Pageable pageable);

    @Query("""
        select h from Henkilo h
        where h.passivoitu = false
          and (h.etunimet ilike :query%
            or h.kutsumanimi ilike :query%
            or h.sukunimi ilike :query%
              )""")
    Page<Henkilo> findAllNotPassivoituByOppijahakuQuery(String query, Pageable pageable);

    @Query("""
        select h from Henkilo h
        where h.sukunimi ilike :sukunimi%
          and (h.etunimet ilike :etunimet% or h.kutsumanimi ilike :etunimet%)""")
    Page<Henkilo> findAllByFullNameOppijahakuQuery(String etunimet, String sukunimi, Pageable pageable);

    @Query("""
        select h from Henkilo h
        where h.passivoitu = false
          and h.sukunimi ilike :sukunimi%
          and (h.etunimet ilike :etunimet% or h.kutsumanimi ilike :etunimet%)""")
    Page<Henkilo> findAllNotPassivoituByFullNameOppijahakuQuery(String etunimet, String sukunimi, Pageable pageable);

    Page<Henkilo> findAllByHetu(String hetu, Pageable pageable);
    Page<Henkilo> findAllByHetuAndPassivoituFalse(String hetu, Pageable pageable);
    Page<Henkilo> findAllByOidHenkilo(String oidHenkilo, Pageable pageable);
    Page<Henkilo> findAllByOidHenkiloAndPassivoituFalse(String oidHenkilo, Pageable pageable);
}
