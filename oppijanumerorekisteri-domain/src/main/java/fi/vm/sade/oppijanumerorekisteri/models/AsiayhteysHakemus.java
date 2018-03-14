package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
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
@Table(name = "asiayhteys_hakemus")
public class AsiayhteysHakemus extends IdentifiableAndVersionedEntity {

    @Column(name = "hakemus_oid", nullable = false)
    private String hakemusOid;

    @Column(name = "loppupaivamaara")
    private LocalDate loppupaivamaara;

}
