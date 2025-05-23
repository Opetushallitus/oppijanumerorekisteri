package fi.vm.sade.oppijanumerorekisteri.repositories;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;

public interface VtjMuutostietoRepository extends CrudRepository<VtjMuutostieto, Long> {
    List<VtjMuutostieto> findByProcessedIsNullOrderByMuutospvAsc();

    List<VtjMuutostieto> findAllByHenkilotunnusOrderByMuutospvAsc(String henkilotunnus);
}
