package fi.vm.sade.oppijanumerorekisteri.clients.model;

import java.util.List;

import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class VtjMuutostietoResponse {
    public Long viimeisinKirjausavain;
    public List<VtjMuutostieto> muutokset;
    public Boolean ajanTasalla;
}
