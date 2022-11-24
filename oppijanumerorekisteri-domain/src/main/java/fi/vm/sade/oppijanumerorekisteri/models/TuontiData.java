package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.Table;

/**
 * Oppijoiden tuonnin tiedot käsittelemättömänä.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tuonti_data")
public class TuontiData extends IdentifiableAndVersionedEntity {

    @Column(name = "data", nullable = false)
    @Lob
    private byte[] data;

}
