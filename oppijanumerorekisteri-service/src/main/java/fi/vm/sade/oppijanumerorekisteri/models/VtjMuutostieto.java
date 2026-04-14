package fi.vm.sade.oppijanumerorekisteri.models;

import com.fasterxml.jackson.annotation.JsonSetter;
import java.time.LocalDateTime;

import tools.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class VtjMuutostieto extends IdentifiableAndVersionedEntity {
    private String henkilotunnus;
    private LocalDateTime muutospv;
    private String tietoryhmat;
    private LocalDateTime processed;
    private Boolean error;

    public VtjMuutostieto(String henkilotunnus, LocalDateTime muutospv, JsonNode tietoryhmat, LocalDateTime processed, Boolean error) {
        this.henkilotunnus = henkilotunnus;
        this.muutospv = muutospv;
        this.tietoryhmat = tietoryhmat != null ? tietoryhmat.toString() : null;
        this.processed = processed;
        this.error = error;
    }

    public void setTietoryhmat(String tietoryhmat) {
        this.tietoryhmat = tietoryhmat;
    }

    @JsonSetter("tietoryhmat")
    public void setTietoryhmat(JsonNode tietoryhmat) {
        this.tietoryhmat = tietoryhmat != null ? tietoryhmat.toString() : null;
    }
}
