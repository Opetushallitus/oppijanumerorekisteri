package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;
import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
@Table(name = "henkilo_huoltaja_suhde", schema = "public")
public class HenkiloHuoltajaSuhde extends IdentifiableAndVersionedEntity {
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn
    private Henkilo lapsi;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn
    private Henkilo huoltaja;

    @Column(name = "alkupvm")
    private LocalDate alkuPvm;

    @Column(name = "loppupvm")
    private LocalDate loppuPvm;

    @Column(name = "created")
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;

    @Column(name = "updated")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updated;

    @PrePersist
    protected void onCreate() {
        created = new Date();
        updated = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updated = new Date();
    }
}
