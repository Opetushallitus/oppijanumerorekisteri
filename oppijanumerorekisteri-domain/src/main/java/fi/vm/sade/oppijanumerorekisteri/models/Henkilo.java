package fi.vm.sade.oppijanumerorekisteri.models;


import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter @Setter
@Table(name = "henkilo", schema = "public")
public class Henkilo extends IdentifiableAndVersionedEntity {

    @Column(nullable = false)
    private String oidhenkilo;

    private String hetu;

    @Column(nullable = false)
    private boolean passivoitu;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private HenkiloTyyppi henkilotyyppi;

    @OneToOne(mappedBy = "henkilo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Kayttajatiedot kayttajatiedot;
}
