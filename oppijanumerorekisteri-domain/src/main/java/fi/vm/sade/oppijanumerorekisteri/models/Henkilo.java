package fi.vm.sade.oppijanumerorekisteri.models;


import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "henkilo", schema = "public")
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = "henkiloWithPerustiedot",
                attributeNodes = {
                        @NamedAttributeNode("asiointikieli"),
                        @NamedAttributeNode("aidinkieli"),
                        @NamedAttributeNode("kansalaisuus")
                }
        )
})
// nullable = false => in database, @Notnull => only in model
public class Henkilo extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = 1428444306553070016L;

    @Column(nullable = false)
    private String oidhenkilo;

    // This constraint is actually not in db level
    @Column(unique = true)
    private String hetu;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private HenkiloTyyppi henkilotyyppi;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aidinkieli_id")
    private Kielisyys aidinkieli;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asiointikieli_id")
    private Kielisyys asiointikieli;

    @NotNull
    @Column(name = "created")
    @Temporal(TemporalType.TIMESTAMP)
    private Date luontiPvm;

    @NotNull
    @Column(name = "modified")
    @Temporal(TemporalType.TIMESTAMP) 
    private Date muokkausPvm;

    @Column(nullable = false)
    private boolean passivoitu;

    @Column(nullable = false)
    private boolean yksiloity;

    @Column(nullable = false)
    private boolean yksiloityvtj;

    @Column(nullable = false)
    private boolean yksilointiYritetty;

    @Column(nullable = false)
    private boolean duplicate;

    @Column(nullable = false)
    private boolean eisuomalaistahetua;

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

    @OneToMany(mappedBy = "henkilo", cascade = CascadeType.ALL, fetch=FetchType.LAZY)
    private Set<YhteystiedotRyhma> yhteystiedotRyhmas = new HashSet<>();
}
