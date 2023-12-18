package fi.vm.sade.oppijanumerorekisteri.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "turvakielto_kotikunta")
public class TurvakieltoKotikunta extends IdentifiableAndVersionedEntity {
    @Column(name = "henkilo_id", unique = true, nullable = false)
    private Long henkiloId;

    @Column(nullable = false)
    private String kotikunta;
}
