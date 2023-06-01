package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

/**
 * Palveluihin perustuva asiayhteys.
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_asiayhteys_palvelu_henkilo"))
    private Henkilo henkilo;

    @Column(nullable = false)
    private String palvelutunniste;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date luotu;

}
