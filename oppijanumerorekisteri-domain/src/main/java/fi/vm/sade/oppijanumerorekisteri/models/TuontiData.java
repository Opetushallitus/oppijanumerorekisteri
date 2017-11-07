package fi.vm.sade.oppijanumerorekisteri.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
