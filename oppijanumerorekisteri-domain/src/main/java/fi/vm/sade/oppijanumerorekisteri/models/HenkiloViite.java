package fi.vm.sade.oppijanumerorekisteri.models;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

/**
 * Duplikaattien henkilöiden tunnistamiseen.
 */
@Entity
@Table(name = "henkiloviite", schema = "public")
@Getter
@Setter
@SqlResultSetMapping(
        name = "map_from_native",
        classes = @ConstructorResult(
                targetClass = HenkiloViiteDto.class,
                columns = {
                        @ColumnResult(name = "henkiloOid", type = String.class),
                        @ColumnResult(name = "masterOid", type = String.class)
                }
        )
)
public class HenkiloViite extends IdentifiableAndVersionedEntity {

    private static final long serialVersionUID = 1L;

    @Column(nullable = false)
    private String masterOid;

    @Column(nullable = false)
    private String slaveOid;

}
