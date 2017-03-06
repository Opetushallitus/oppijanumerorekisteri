package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

/**
 * Hetuttoman henkilön tunnistamiseen käytettävä tieto (esimerkiksi
 * sähköpostiosoite). Tunniste muodostuu {@link #idpEntityId avaimesta} ja
 * {@link #identifier arvosta}.
 *
 * @see Henkilo#identifications henkilön tunnisteet
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "identification")
@Entity
public class Identification extends IdentifiableAndVersionedEntity {

    private static final long serialVersionUID = -2726844344901551508L;

    /**
     * Tunnisteen avain, esimerkiksi "email".
     */
    @Column(name = "idpentityid", nullable = false)
    private String idpEntityId;

    /**
     * Tunnisteen arvo, esimerkiksi "example@example.com".
     */
    @Column(nullable = false)
    private String identifier;

    /**
     * @deprecated Sarake löytyy henkilöpalvelun tietokannasta, mutta sille ei
     * ole tällä hetkellä käyttöä oppijanumerorekisterin puolella
     */
    @Deprecated
    private String authtoken;

    /**
     * @deprecated Sarake löytyy henkilöpalvelun tietokannasta, mutta sille ei
     * ole tällä hetkellä käyttöä oppijanumerorekisterin puolella
     */
    @Deprecated
    private String email;

    /**
     * @deprecated Sarake löytyy henkilöpalvelun tietokannasta, mutta sille ei
     * ole tällä hetkellä käyttöä oppijanumerorekisterin puolella
     */
    @Temporal(TemporalType.TIMESTAMP)
    @Deprecated
    private Date expirationDate;

}
