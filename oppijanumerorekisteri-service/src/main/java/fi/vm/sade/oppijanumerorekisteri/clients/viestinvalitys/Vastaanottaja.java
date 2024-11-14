package fi.vm.sade.oppijanumerorekisteri.clients.viestinvalitys;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Vastaanottaja {
    private String nimi;
    @NonNull
    private String sahkopostiOsoite;
}
