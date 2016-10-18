package fi.vm.sade.oppijanumerorekisteri.models;


import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@Table(name = "henkilo", schema = "public")
@NamedEntityGraph(
        name = "henkiloWithKansalaisuusAndAidinkieli",
        attributeNodes = {
                @NamedAttributeNode(value = "kansalaisuus"),
                @NamedAttributeNode(value = "aidinkieli")
        }
)
public class Henkilo extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = 1428444306553070016L;

    @Column(nullable = false)
    private String oidhenkilo;

    private String hetu;

    @Column(nullable = false)
    private boolean passivoitu;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private HenkiloTyyppi henkilotyyppi;

    private String kutsumanimi;

    private String sukunimi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aidinkieli_id")
    private Kielisyys aidinkieli;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "henkilo_kielisyys", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "kielisyys_id",
            referencedColumnName = "id"))
    private Set<Kielisyys> kielisyys = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "henkilo_kansalaisuus", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(
            name = "kansalaisuus_id", referencedColumnName = "id"))
    private Set<Kansalaisuus> kansalaisuus = new HashSet<>();

}
