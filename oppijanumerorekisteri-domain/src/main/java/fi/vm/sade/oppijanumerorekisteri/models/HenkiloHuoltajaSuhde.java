package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "henkilo_huoltaja_suhde", schema = "public")
public class HenkiloHuoltajaSuhde extends IdentifiableAndVersionedEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Henkilo lapsi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Henkilo huoltaja;

    private String huoltajuustyyppiKoodi;
}
