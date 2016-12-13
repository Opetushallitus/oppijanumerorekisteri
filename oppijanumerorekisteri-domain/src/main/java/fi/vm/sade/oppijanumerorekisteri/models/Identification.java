package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "identification")
@Entity
public class Identification extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = -2726844344901551508L;

    @ManyToOne( cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH }, fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id", nullable = false)
    private Henkilo henkilo;

    @Column(nullable = false)
    private String idpentityid;

    @Column(nullable = false)
    private String identifier;

    private String authtoken;

    private String email;

    @Temporal(TemporalType.TIMESTAMP)
    private Date expirationDate;

}
