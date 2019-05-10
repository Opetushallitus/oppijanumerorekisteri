package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;

import org.hibernate.envers.Audited;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
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
