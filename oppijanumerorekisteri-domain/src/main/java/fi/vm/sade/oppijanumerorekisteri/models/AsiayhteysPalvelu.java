package fi.vm.sade.oppijanumerorekisteri.models;

import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
