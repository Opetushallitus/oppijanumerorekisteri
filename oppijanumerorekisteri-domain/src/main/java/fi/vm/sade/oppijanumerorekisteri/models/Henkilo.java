package fi.vm.sade.oppijanumerorekisteri.models;


import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "henkilo", schema = "public")
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = "henkiloDto",
                attributeNodes = {
                        @NamedAttributeNode("asiointikieli"),
                        @NamedAttributeNode("aidinkieli"),
                        @NamedAttributeNode("kielisyys"),
                        @NamedAttributeNode("kansalaisuus")
                }
        )
})
// nullable = false => in database, @Notnull => only in model
public class Henkilo extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = 1428444306553070016L;

    @Column(name = "oidhenkilo", nullable = false)
    private String oidHenkilo;

    // This constraint is actually not set in db level
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

    @Column(name = "vtjsync_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    private Date vtjsynced;

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

    @OneToMany(mappedBy = "henkilo", cascade = CascadeType.ALL, fetch=FetchType.LAZY, orphanRemoval = true)
    private Set<YhteystiedotRyhma> yhteystiedotRyhmas = new HashSet<>();

    @Column(name = "kasittelija")
    private String kasittelijaOid;

    private String sukupuoli;

    @Temporal(TemporalType.DATE)
    private Date syntymaaika;

    private String passinnumero;

    private String oppijanumero;

    @ManyToOne
    @JoinColumn(name = "huoltaja_id")
    private Henkilo huoltaja;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "henkilo", cascade = { CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.REFRESH })
    private Set<Identification> identifications = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "henkilo", cascade = { CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.REFRESH })
    private Set<ExternalId> externalIds = new HashSet<>();

    public void clearYhteystiedotRyhmas() {
        this.yhteystiedotRyhmas.clear();
    }

    public void addYhteystiedotRyhma(YhteystiedotRyhma yhteystiedotRyhma) {
        this.yhteystiedotRyhmas.add(yhteystiedotRyhma);
    }

    public void clearKielisyys() {
        this.kielisyys.clear();
    }

    public void addKielisyys(Kielisyys kielisyys) {
        this.kielisyys.add(kielisyys);
    }
}
