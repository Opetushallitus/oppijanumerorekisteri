package fi.vm.sade.oppijanumerorekisteri.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikuntaHistoria;
import java.util.List;


@Repository
public interface TurvakieltoKotikuntaHistoriaRepository extends CrudRepository<TurvakieltoKotikuntaHistoria, Long> {
    public List<TurvakieltoKotikuntaHistoria> findAllByHenkiloId(Long henkiloId);
    public Optional<TurvakieltoKotikuntaHistoria> findByHenkiloIdAndKunnastaPoisMuuttopvIsNull(Long henkiloId);
}
