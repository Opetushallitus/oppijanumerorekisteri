package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;

@EqualsAndHashCode(callSuper = false)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = @UniqueConstraint(name = "UK_kielisyys_01",
        columnNames = { "kielikoodi" }))
@Entity
public class Kielisyys extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = -2129513559888443220L;

    @Column(name = "kielikoodi")
    private String kieliKoodi; // koodisto 'kieli'

    @Column(name = "kielityyppi")
    private String kieliTyyppi;

    public Kielisyys(String kieliKoodi) {
        this.kieliKoodi = kieliKoodi;
    }
}
