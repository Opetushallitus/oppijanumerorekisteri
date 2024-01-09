package fi.vm.sade.oppijanumerorekisteri.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import java.util.List;


@Repository
public interface KotikuntaHistoriaRepository extends CrudRepository<KotikuntaHistoria, Long> {
    public List<KotikuntaHistoria> findAllByHenkiloId(Long henkiloId);
    public Optional<KotikuntaHistoria> findByHenkiloIdAndKunnastaPoisMuuttopvIsNull(Long henkiloId);
}
