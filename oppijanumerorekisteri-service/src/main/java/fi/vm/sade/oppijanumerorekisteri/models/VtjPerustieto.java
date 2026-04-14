package fi.vm.sade.oppijanumerorekisteri.models;

import com.fasterxml.jackson.annotation.JsonSetter;
import tools.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class VtjPerustieto {
    private String henkilotunnus;
    private String tietoryhmat;

    public VtjPerustieto(String henkilotunnus, JsonNode tietoryhmat) {
        this.henkilotunnus = henkilotunnus;
        this.tietoryhmat = tietoryhmat != null ? tietoryhmat.toString() : null;
    }

    public void setTietoryhmat(String tietoryhmat) {
        this.tietoryhmat = tietoryhmat;
    }

    @JsonSetter("tietoryhmat")
    public void setTietoryhmat(JsonNode tietoryhmat) {
        this.tietoryhmat = tietoryhmat != null ? tietoryhmat.toString() : null;
    }
}
