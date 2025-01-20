package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;
import org.hibernate.annotations.BatchSize;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@EqualsAndHashCode(callSuper = false)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = @UniqueConstraint(name = "UK_kielisyys_01",
        columnNames = { "kielikoodi" }))
@Entity
@BatchSize(size =  1000)
public class Kielisyys extends IdentifiableAndVersionedEntity {

    @Column(name = "kielikoodi")
    private String kieliKoodi; // koodisto 'kieli'

    @Column(name = "kielityyppi")
    private String kieliTyyppi;

    public Kielisyys(String kieliKoodi) {
        this.kieliKoodi = kieliKoodi;
    }
}
