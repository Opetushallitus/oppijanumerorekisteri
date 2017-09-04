package fi.vm.sade.oppijanumerorekisteri.models;

import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Oppijoita tuodaan oppijanumerorekisteriin oppilashallintojärjestelmistä
 * eräajona. Tämä kerää yhteen tuodut oppijat yhdestä eräajosta.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tuonti")
public class Tuonti extends IdentifiableAndVersionedEntity {

    /**
     * Sähköposti yhteydenottoa varten.
     */
    @Column(name = "sahkoposti")
    private String sahkoposti;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tuonti_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tuonti_rivi_tuonti"))
    private Set<TuontiRivi> henkilot;

}
