package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;

@Getter
@Setter
@MappedSuperclass
public class IdentifiableAndVersionedEntity implements Persistable<Long> {
    private static final long serialVersionUID = 5576257928837225161L;

    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue
    private Long id;
    
    @Version
    @Column(nullable = false)
    private Long version;
    
    @Override
    @Transient
    public boolean isNew() {
        return null == this.getId();
    }
}
