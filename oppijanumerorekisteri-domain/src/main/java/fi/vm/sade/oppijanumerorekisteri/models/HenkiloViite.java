package fi.vm.sade.oppijanumerorekisteri.models;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import lombok.*;

import jakarta.persistence.*;

/**
 * Duplikaattien henkilöiden tunnistamiseen.
 */
@Entity
@Table(name = "henkiloviite", schema = "public")
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(nullable = false)
    private String masterOid;

    @Column(nullable = false)
    private String slaveOid;

}
