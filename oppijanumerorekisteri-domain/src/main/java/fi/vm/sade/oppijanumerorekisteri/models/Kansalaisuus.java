package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

/**
 * Kansalaisuus koodistosta "maatjavaltiot2".
 *
 * @see Henkilo#kansalaisuus henkilön kansalaisuudet
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Entity
public class Kansalaisuus extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = 1807970088588578536L;

    public static final String SUOMI = "246";

    @Column(name = "kansalaisuuskoodi", nullable = false, unique = true)
    private String kansalaisuusKoodi;

}
