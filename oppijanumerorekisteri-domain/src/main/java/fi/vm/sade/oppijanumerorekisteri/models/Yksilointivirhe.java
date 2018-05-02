package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
import java.util.Date;

/**
 * Yksilöinnin tausta-ajossa tapahtunut virhe.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "yksilointivirhe", uniqueConstraints = {
        @UniqueConstraint(name = "uk_yksilointivirhe_01", columnNames = "henkilo_id"),
})
public class Yksilointivirhe extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_yksilointivirhe_henkilo"))
    private Henkilo henkilo;

    @Column(name = "aikaleima", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date aikaleima;

    @Column(name = "poikkeus", nullable = false)
    private String poikkeus;

    @Column(name = "viesti")
    private String viesti;

    public Yksilointivirhe(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

}
