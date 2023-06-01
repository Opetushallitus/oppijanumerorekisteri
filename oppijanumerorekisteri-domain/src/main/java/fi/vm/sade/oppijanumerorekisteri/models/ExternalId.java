package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Getter
@Setter
@Table(name = "externalid", uniqueConstraints = @UniqueConstraint(name = "UK_externalid_01",
        columnNames = { "externalid", "henkilo_id" }))
@Entity
public class ExternalId extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = -9077794218055694787L;

    @Column(nullable = false)
    private String externalid;

}
