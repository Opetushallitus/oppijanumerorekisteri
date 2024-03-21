package fi.vm.sade.oppijanumerorekisteri.models;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import lombok.*;

import jakarta.persistence.*;
import java.util.Objects;

import static java.util.Objects.requireNonNull;

/**
 * Yksittäinen yhteystieto (esimerkiksi sähköpostiosoite tai puhelinnumero).
 *
 * @see YhteystiedotRyhma ryhmä johon yhteystieto kuuluu
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "yhteystiedot")
public class Yhteystieto extends IdentifiableAndVersionedEntity {

    private static final long serialVersionUID = 6759092678225935728L;

    @Column(name = "yhteystieto_tyyppi")
    @Enumerated(EnumType.STRING)
    private YhteystietoTyyppi yhteystietoTyyppi;

    @Column(name = "yhteystieto_arvo")
    private String yhteystietoArvo;

    public boolean isEquivalentTo(YhteystietoDto u) {
        // tyyppi (+ryhma_id) ei ole tietokantatasolla uniikki mutta ehkä pitäisi olla
        return Objects.equals(yhteystietoTyyppi, u.getYhteystietoTyyppi());
    }

    public static YhteystietoBuilder builder(YhteystietoTyyppi yhteystietoTyyppi, String yhteystietoArvo) {
        return new Builder(yhteystietoTyyppi, yhteystietoArvo);
    }

    public interface YhteystietoBuilder {

        YhteystietoBuilder id(Long id);

        Yhteystieto build();

    }

    private static class Builder implements YhteystietoBuilder {

        private final YhteystietoTyyppi yhteystietoTyyppi;
        private final String yhteystietoArvo;
        private Long id;

        public Builder(YhteystietoTyyppi yhteystietoTyyppi, String yhteystietoArvo) {
            this.yhteystietoTyyppi = yhteystietoTyyppi;
            this.yhteystietoArvo = yhteystietoArvo;
        }

        @Override
        public Builder id(Long id) {
            this.id = requireNonNull(id);
            return this;
        }

        @Override
        public Yhteystieto build() {
            Yhteystieto yhteystieto = new Yhteystieto();
            yhteystieto.setId(id);
            yhteystieto.setYhteystietoTyyppi(yhteystietoTyyppi);
            yhteystieto.setYhteystietoArvo(yhteystietoArvo);
            return yhteystieto;
        }

    }

}
