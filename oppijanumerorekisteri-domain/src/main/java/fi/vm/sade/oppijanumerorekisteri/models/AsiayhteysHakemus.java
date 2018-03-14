package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

/**
 * Hakemuksiin perustuva asiayhteys.
 *
 * @see Henkilo#asiayhteysHakemukset henkilön asiayhteydet
 */
@Getter
@Setter
@Entity
@Table(name = "asiayhteys_hakemus", uniqueConstraints = {
    @UniqueConstraint(name = "uk_henkilo_hakemus", columnNames = {"henkilo_id", "hakemus_oid"})
})
public class AsiayhteysHakemus extends IdentifiableAndVersionedEntity {

    @Column(name = "hakemus_oid", nullable = false)
    private String hakemusOid;

    @Column(name = "loppupaivamaara", nullable = false)
    private LocalDate loppupaivamaara;

}
