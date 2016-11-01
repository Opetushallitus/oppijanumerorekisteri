package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = false)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(name = "UK_kielisyys_01",
        columnNames = { "kielikoodi" }))
@Entity
public class Kielisyys extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = -2129513559888443220L;

    private String kielikoodi;

    private String kielityyppi;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "kielisyys")
    private Set<Henkilo> henkilos = new HashSet<>();
}
