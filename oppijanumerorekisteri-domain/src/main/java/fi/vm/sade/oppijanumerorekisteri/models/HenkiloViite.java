package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Getter
@Setter
@Entity
@Table(name = "henkiloviite")
public class HenkiloViite extends IdentifiableAndVersionedEntity {
    @Column(name = "master_oid", nullable = false)
    private String masterOid;
    
    @Column(name = "slave_oid", nullable = false)
    private String slaveOid;
}
