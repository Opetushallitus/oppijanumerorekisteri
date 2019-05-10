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
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn
    private Henkilo lapsi;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn
    private Henkilo huoltaja;

    private String huoltajuustyyppiKoodi;

    public Henkilo getHuoltaja(){
        return this.huoltaja;
    }
}
