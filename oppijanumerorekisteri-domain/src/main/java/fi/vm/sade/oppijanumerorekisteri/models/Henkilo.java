package fi.vm.sade.oppijanumerorekisteri.models;


import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiTila;
import java.time.LocalDate;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import org.hibernate.annotations.BatchSize;

@Builder(builderClassName = "builder")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "henkilo", schema = "public")
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = "henkiloDto",
                attributeNodes = {
                        @NamedAttributeNode("asiointiKieli"),
                        @NamedAttributeNode("aidinkieli"),
                        @NamedAttributeNode("kielisyys"),
                }
        )
})
// nullable = false => in database, @Notnull => only in model
public class Henkilo extends IdentifiableAndVersionedEntity {
    private static final long serialVersionUID = 1428444306553070016L;

    @Column(name = "oidhenkilo", nullable = false)
    private String oidHenkilo;

    @Column(unique = true)
    private String hetu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aidinkieli_id")
    private Kielisyys aidinkieli;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asiointikieli_id")
    private Kielisyys asiointiKieli;

    @NotNull
    @Column(name = "created")
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;

    @NotNull
    @Column(name = "modified")
    @Temporal(TemporalType.TIMESTAMP) 
    private Date modified;

    @Column(name = "vtjsync_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    private Date vtjsynced;

    @Column(name = "vtj_register", columnDefinition = "boolean default false", nullable = false)
    private boolean vtjRegister;

    @Column(nullable = false)
    private boolean passivoitu;

    /**
     * true jos virkailija on manuaalisesti yksilöinyt hetuttoman henkilön.
     */
    @Column(nullable = false)
    private boolean yksiloity;

    /**
     * true jos hetullinen henkilö on automaattisesti yksilöity VTJ:stä.
     */
    @Column(nullable = false)
    private boolean yksiloityVTJ;

    /**
     * true jos hetulliselle henkilölle on yritetty automaattista yksilöintiä.
     */
    @Column(nullable = false)
    private boolean yksilointiYritetty;

    @Column(name = "ei_yksiloida", nullable = false)
    private boolean eiYksiloida;

    @Column(nullable = false)
    private boolean duplicate;

    @Column(name = "eisuomalaistahetua", nullable = false)
    private boolean eiSuomalaistaHetua;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "henkilo_kielisyys", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "kielisyys_id",
            referencedColumnName = "id"))
    @BatchSize(size = 1000)
    private Set<Kielisyys> kielisyys = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "henkilo_kansalaisuus", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(
            name = "kansalaisuus_id", referencedColumnName = "id"))
    @BatchSize(size = 100)
    private Set<Kansalaisuus> kansalaisuus = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "henkilo_id")
    @BatchSize(size = 1000)
    private Set<YhteystiedotRyhma> yhteystiedotRyhma = new HashSet<>();

    @Column(name = "kasittelija")
    private String kasittelijaOid;

    // Koodisto uses value "1" for male and "2" for female.
    private String sukupuoli;

    private LocalDate syntymaaika;

    private LocalDate kuolinpaiva;

    private String kotikunta; // kunta-koodisto

    private String oppijanumero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "huoltaja_id")
    private Henkilo huoltaja;

    @OneToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE })
    @JoinColumn(name = "henkilo_id", nullable = false)
    private Set<Identification> identifications = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH })
    @JoinColumn(name = "henkilo_id", nullable = false)
    private Set<ExternalId> externalIds = new HashSet<>();

    private Boolean turvakielto = false;

    @OneToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH }, orphanRemoval = true)
    @JoinColumn(name = "henkilo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_asiayhteys_palvelu_henkilo"))
    private Set<AsiayhteysPalvelu> asiayhteysPalvelut;

    /**
     * Oppijan organisaatiot. Huom! virkailijan organisaatiot ovat
     * käyttöoikeuspalvelussa.
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH })
    @JoinTable(name = "henkilo_organisaatio",
            joinColumns = @JoinColumn(name = "henkilo_id", referencedColumnName = "id"),
            foreignKey = @ForeignKey(name = "fk_henkilo_organisaatio_henkilo"),
            inverseJoinColumns = @JoinColumn(name = "organisaatio_id", referencedColumnName = "id"),
            inverseForeignKey = @ForeignKey(name = "fk_henkilo_organisaatio_organisaatio"))
    private Set<Organisaatio> organisaatiot;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "henkilo_passinumero",
            joinColumns = @JoinColumn(name = "henkilo_id"),
            foreignKey = @ForeignKey(name = "fk_henkilo_passinumero"),
            uniqueConstraints = @UniqueConstraint(name = "uk_passinumero_01", columnNames = "passinumero"))
    @Column(name = "passinumero", nullable = false)
    private Set<String> passinumerot;

    public void clearYhteystiedotRyhmas() {
        this.yhteystiedotRyhma.clear();
    }

    public void clearKansalaisuus() {
        if(this.kansalaisuus == null) {
            this.kansalaisuus = new HashSet<>();
        }
        this.kansalaisuus.clear();
    }

    public void addKansalaisuus(Kansalaisuus kansalaisuus) {
        this.kansalaisuus.add(kansalaisuus);
    }

    public void addAllYhteystiedotRyhmas(Set<YhteystiedotRyhma> yhteystiedotRyhmas) {
        this.yhteystiedotRyhma.addAll(yhteystiedotRyhmas);
    }

    public void addYhteystiedotRyhma(YhteystiedotRyhma yhteystiedotRyhma) {
        this.yhteystiedotRyhma.add(yhteystiedotRyhma);
    }

    public void clearKielisyys() {
        this.kielisyys.clear();
    }

    public void addKielisyys(Kielisyys kielisyys) {
        this.kielisyys.add(kielisyys);
    }

    public Boolean isTurvakielto() {
        return turvakielto;
    }

    public void setTurvakielto(Boolean turvakielto) {
        this.turvakielto = turvakielto;
    }

    public Boolean hasNoFakeHetu() {
        return !(hetu.charAt(7) == '9');
    }

    public Boolean isNotBlackListed() {
        return !isEiYksiloida();
    }

    public boolean addOrganisaatio(Organisaatio organisaatio) {
        if (organisaatiot == null) {
            organisaatiot = new HashSet<>();
        }
        return organisaatiot.add(organisaatio);
    }

    public boolean removeOrganisaatio(Organisaatio organisaatio) {
        if (organisaatiot == null) {
            return false;
        }
        return organisaatiot.remove(organisaatio);
    }

    /**
     * Palauttaa henkilön yksilöinnin tilan.
     *
     * @return yksilöinnin tila
     * @see YksilointiTila tilojen määritykset
     */
    public YksilointiTila getYksilointiTila() {
        if (yksiloity || yksiloityVTJ) {
            return YksilointiTila.OK;
        }
        if (hetu == null) {
            return YksilointiTila.HETU_PUUTTUU;
        }
        if (yksilointiYritetty) {
            return YksilointiTila.VIRHE;
        }
        return YksilointiTila.KESKEN;
    }

    // Initialize default values for lombok builder
    public static class builder {
        private Boolean yksiloity = false;
        private Boolean yksiloityVTJ = false;
        private Boolean yksilointiYritetty = false;
        private Boolean eiYksiloida = false;
        private Boolean duplicate = false;
        private Boolean eiSuomalaistaHetua = false;
        private Boolean turvakielto = false;

        private String sukupuoli = "1";

    }
}
