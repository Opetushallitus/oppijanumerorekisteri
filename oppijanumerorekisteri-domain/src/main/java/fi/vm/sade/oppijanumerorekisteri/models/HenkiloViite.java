package fi.vm.sade.oppijanumerorekisteri.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Duplikaattien henkilöiden tunnistamiseen.
 */
@Entity
@Table(name = "henkiloviite", schema = "public")
@Getter
@Setter
public class HenkiloViite extends IdentifiableAndVersionedEntity {

    private static final long serialVersionUID = 1L;

    @Column(nullable = false)
    private String masterOid;

    @Column(nullable = false)
    private String slaveOid;

}
