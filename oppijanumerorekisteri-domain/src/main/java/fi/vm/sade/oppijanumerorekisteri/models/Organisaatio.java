package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/**
 * Oppijan organisaatio.
 *
 * Virkailijan organisaatiot ovat käyttöoikeuspalvelussa!
 *
 * @see Henkilo#organisaatiot oppijan organisaatiot
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "organisaatio", uniqueConstraints = {
    @UniqueConstraint(name = "uk_organisaatio_01", columnNames = "oid")
})
public class Organisaatio extends IdentifiableAndVersionedEntity {

    @Column(nullable = false)
    private String oid;

}
