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
 * @see Henkilo#yksilointiSynkronoinnit henkilön synkronoinnit
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "yksilointi_synkronointi", uniqueConstraints = {
    @UniqueConstraint(name = "uk_henkilo_palvelutunniste", columnNames = {"henkilo_id", "palvelutunniste"}),
})
public class YksilointiSynkronointi extends IdentifiableAndVersionedEntity {

    @Column(nullable = false)
    private String palvelutunniste;

    @Column(nullable = false)
    private Date luotu;

}