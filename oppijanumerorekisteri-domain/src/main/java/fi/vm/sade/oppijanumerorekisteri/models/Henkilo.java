package fi.vm.sade.oppijanumerorekisteri.models;


import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiTila;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.hibernate.envers.RelationTargetAuditMode;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Builder(builderClassName = "builder")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "henkilo", schema = "public")
@Audited
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = "henkiloDto",
                attributeNodes = {
                        @NamedAttributeNode("asiointiKieli"),
                        @NamedAttributeNode("aidinkieli"),
                        @NamedAttributeNode("kielisyys"),
                        @NamedAttributeNode("yksilointivirheet"),
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
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Kielisyys aidinkieli;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asiointikieli_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
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

    @Column(nullable = false)
    private boolean duplicate;

    @Column(name = "eisuomalaistahetua", nullable = false)
    private boolean eiSuomalaistaHetua;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "henkilo_kielisyys", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "kielisyys_id",
            referencedColumnName = "id"))
    @BatchSize(size = 1000)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Set<Kielisyys> kielisyys = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "henkilo_kansalaisuus", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(
            name = "kansalaisuus_id", referencedColumnName = "id"))
    @BatchSize(size = 100)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Set<Kansalaisuus> kansalaisuus = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "henkilo_id")
    @BatchSize(size = 1000)
    @NotAudited
    private Set<YhteystiedotRyhma> yhteystiedotRyhma = new HashSet<>();

    @Column(name = "kasittelija")
    private String kasittelijaOid;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "henkilo", orphanRemoval = true, cascade = CascadeType.PERSIST)
    @NotAudited
    Set<Yksilointivirhe> yksilointivirheet = new HashSet<>();

    private String sukupuoli; // sukupuoli-koodisto

    private LocalDate syntymaaika;

    private LocalDate kuolinpaiva;

    private String kotikunta; // kunta-koodisto

    private String oppijanumero;

    @OneToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE })
    @JoinColumn(name = "henkilo_id", nullable = false)
    @NotAudited
    private Set<Identification> identifications = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH })
    @JoinColumn(name = "henkilo_id", nullable = false)
    @NotAudited
    private Set<ExternalId> externalIds = new HashSet<>();

    private Boolean turvakielto = false;

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
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Set<Organisaatio> organisaatiot;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "henkilo_passinumero",
            joinColumns = @JoinColumn(name = "henkilo_id"),
            foreignKey = @ForeignKey(name = "fk_henkilo_passinumero"),
            uniqueConstraints = @UniqueConstraint(name = "uk_passinumero_01", columnNames = "passinumero"))
    @Column(name = "passinumero", nullable = false)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Set<String> passinumerot;

    @OneToMany(mappedBy = "lapsi", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @NotAudited
    private Set<HenkiloHuoltajaSuhde> huoltajat = new HashSet<>();

    public void clearYhteystiedotRyhmas() {
        this.yhteystiedotRyhma.clear();
    }

    public void clearKansalaisuus() {
        if (this.kansalaisuus == null) {
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

    public Boolean isHetuFake() {
        return hetu.charAt(7) == '9';
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
        if (duplicate || passivoitu) {
            return YksilointiTila.OK;
        }
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
