package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Getter
@Setter
@Table(name = "externalid", uniqueConstraints = @UniqueConstraint(name = "UK_externalid_01",
        columnNames = { "externalid", "henkilo_id" }))
@Entity
public class ExternalId extends IdentifiableAndVersionedEntity {
    @Column(nullable = false)
    private String externalid;

}
