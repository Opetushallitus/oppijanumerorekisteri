package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;

/**
 * Käyttöoikeuksiin perustuva asiayhteys.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "asiayhteys_kayttooikeus", uniqueConstraints = {
    @UniqueConstraint(name = "uk_henkilo", columnNames = {"henkilo_id"})
})
public class AsiayhteysKayttooikeus extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_asiayhteys_kayttooikeus_henkilo"))
    private Henkilo henkilo;

    @Column(name = "loppupaivamaara", nullable = false)
    private LocalDate loppupaivamaara;

    public AsiayhteysKayttooikeus(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

}
