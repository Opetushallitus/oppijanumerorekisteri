package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Käyttöoikeuksiin perustuva asiayhteys.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "asiayhteys_kayttooikeus")
public class AsiayhteysKayttooikeus extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_asiayhteys_kayttooikeus_henkilo"))
    private Henkilo henkilo;

    @Column(name = "loppupaivamaara", nullable = false)
    private LocalDate loppupaivamaara;

    public AsiayhteysKayttooikeus(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

}
