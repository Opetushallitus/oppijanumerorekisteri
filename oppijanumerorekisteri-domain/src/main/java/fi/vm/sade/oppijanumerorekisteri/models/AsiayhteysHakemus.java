package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Hakemuksiin perustuva asiayhteys.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "asiayhteys_hakemus", uniqueConstraints = {
    @UniqueConstraint(name = "uk_henkilo_hakemus", columnNames = {"henkilo_id", "hakemus_oid"})
})
public class AsiayhteysHakemus extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_asiayhteys_hakemus_henkilo"))
    private Henkilo henkilo;

    @Column(name = "hakemus_oid", nullable = false)
    private String hakemusOid;

    @Column(name = "loppupaivamaara", nullable = false)
    private LocalDate loppupaivamaara;

    public AsiayhteysHakemus(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

}
