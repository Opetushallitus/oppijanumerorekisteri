package fi.vm.sade.oppijanumerorekisteri.models;

import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
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
    @Temporal(TemporalType.TIMESTAMP)
    private Date loppupaivamaara;

}
