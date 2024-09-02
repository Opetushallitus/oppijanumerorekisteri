package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import jakarta.persistence.*;

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

    @Column(name = "idpentityid", nullable = false)
    @Enumerated(EnumType.STRING)
    private IdpEntityId idpEntityId;

    @Column(nullable = false)
    private String identifier;
}
