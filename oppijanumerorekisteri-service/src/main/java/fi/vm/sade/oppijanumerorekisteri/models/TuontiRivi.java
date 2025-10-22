package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import jakarta.persistence.*;

/**
 * Liitos {@link Tuonti oppijoiden tuonnin} ja {@link Henkilo henkilön} välillä.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tuonti_rivi", indexes = {
    @Index(name = "ix_tuonti_rivi_01", columnList = "tuonti_id, henkilo_id")
})
public class TuontiRivi extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tuonti_rivi_henkilo"))
    private Henkilo henkilo;

    @Column(name = "henkilo_id", insertable = false, updatable = false)
    private Long henkiloId;

    /**
     * Lähdejärjestelmän käyttämä rivin tunniste (jos sellainen on).
     */
    @Column(name = "tunniste")
    private String tunniste;

    @Column(name = "conflict")
    private Boolean conflict;

    public TuontiRivi(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

}
