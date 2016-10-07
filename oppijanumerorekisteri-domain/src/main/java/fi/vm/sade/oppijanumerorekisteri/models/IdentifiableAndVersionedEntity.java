package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.AbstractPersistable;

import javax.persistence.*;

@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
public class IdentifiableAndVersionedEntity extends AbstractPersistable<Long> {
    @Id
    @Column(name = "id", unique = true, nullable = false)
    @GeneratedValue
    private Long id;
    
    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
