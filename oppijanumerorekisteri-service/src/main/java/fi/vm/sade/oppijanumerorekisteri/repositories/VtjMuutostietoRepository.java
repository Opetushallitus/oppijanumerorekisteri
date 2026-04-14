package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;

import java.util.List;
import java.util.Optional;

public interface VtjMuutostietoRepository {
    VtjMuutostieto save(VtjMuutostieto muutostieto);

    List<VtjMuutostieto> saveAll(Iterable<VtjMuutostieto> muutostiedot);

    Optional<VtjMuutostieto> findById(Long id);

    List<VtjMuutostieto> findAll();

    List<VtjMuutostieto> findByProcessedIsNullOrErrorIsTrueOrderByMuutospvAsc();

    List<VtjMuutostieto> findAllByHenkilotunnusOrderByMuutospvAsc(String henkilotunnus);
}
