package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import jakarta.persistence.*;
import java.util.Date;

/**
 * Yksilöinnin tausta-ajossa tapahtunut virhe.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @Column(name = "uudelleenyritys_maara")
    private Integer uudelleenyritysMaara;

    @Column(name = "uudelleenyritys_aikaleima")
    private Date uudelleenyritysAikaleima;

    public Yksilointivirhe(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

}
