package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

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
