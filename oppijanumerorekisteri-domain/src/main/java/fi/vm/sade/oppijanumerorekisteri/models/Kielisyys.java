package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = false, exclude = "henkilos")
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
    private String kieliKoodi;

    @Column(name = "kielityyppi")
    private String kieliTyyppi;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "kielisyys")
    private Set<Henkilo> henkilos = new HashSet<>();

}
