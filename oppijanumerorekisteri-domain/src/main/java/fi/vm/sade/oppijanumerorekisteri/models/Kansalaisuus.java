package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ManyToMany;
import java.util.Set;

@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
@Entity
public class Kansalaisuus extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = 1807970088588578536L;

    @Column(name = "kansalaisuuskoodi", nullable = false, unique = true)
    private String kansalaisuuskoodi;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "kansalaisuus")
    private Set<Henkilo> henkilos;

}
