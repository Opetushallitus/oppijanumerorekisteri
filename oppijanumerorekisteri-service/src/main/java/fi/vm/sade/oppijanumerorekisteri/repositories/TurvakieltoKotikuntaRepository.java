package fi.vm.sade.oppijanumerorekisteri.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikunta;

@Repository
public interface TurvakieltoKotikuntaRepository extends CrudRepository<TurvakieltoKotikunta, Long> {
    public Optional<TurvakieltoKotikunta> findByHenkiloId(Long henkiloId);
}
