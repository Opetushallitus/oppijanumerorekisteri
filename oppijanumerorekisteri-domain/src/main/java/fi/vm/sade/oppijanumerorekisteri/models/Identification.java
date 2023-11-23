package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;

import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;

/**
 * Hetuttoman henkilön tunnistamiseen käytettävä tieto (esimerkiksi
 * sähköpostiosoite). Tunniste muodostuu {@link #idpEntityId avaimesta} ja
 * {@link #identifier arvosta}.
 *
 * @see Henkilo#identifications henkilön tunnisteet
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "identification")
@Entity
public class Identification extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = -2726844344901551508L;

    @Column(name = "idpentityid", nullable = false)
    @Enumerated(EnumType.STRING)
    private IdpEntityId idpEntityId;

    @Column(nullable = false)
    private String identifier;
}
