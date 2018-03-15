package fi.vm.sade.oppijanumerorekisteri.models;

import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Henkilön yksilöinnin synkronointiflagi. Tämän avulla henkilölle voidaan
 * asettaa yksilöinnin synkronointi päälle/pois päältä palveluittain.
 *
 * @see Henkilo#asiayhteysPalvelut henkilön asiayhteydet
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "asiayhteys_palvelu", uniqueConstraints = {
    @UniqueConstraint(name = "uk_henkilo_palvelutunniste", columnNames = {"henkilo_id", "palvelutunniste"}),
})
public class AsiayhteysPalvelu extends IdentifiableAndVersionedEntity {

    @Column(nullable = false)
    private String palvelutunniste;

    @Column(nullable = false)
    private Date luotu;

}
