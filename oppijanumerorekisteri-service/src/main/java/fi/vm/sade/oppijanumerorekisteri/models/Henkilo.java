package fi.vm.sade.oppijanumerorekisteri.models;

import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiTila;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.hibernate.envers.RelationTargetAuditMode;
import org.springframework.util.StringUtils;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

import static java.util.Arrays.asList;

@Builder(builderClassName = "builder")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "henkilo", schema = "public")
@Audited
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = Henkilo.DTO_ENTITY_GRAPH,
                attributeNodes = {
                        @NamedAttributeNode("asiointiKieli"),
                        @NamedAttributeNode("aidinkieli"),
                        @NamedAttributeNode("yksilointivirheet"),
                }
        )
})
@SqlResultSetMapping(
        name = Henkilo.DUPLICATE_RESULT_MAPPING,
        entities = @EntityResult(entityClass = Henkilo.class),
        columns = @ColumnResult(name = "nimetsimilarity", type = float.class)
)
// nullable = false => in database, @Notnull => only in model
public class Henkilo extends IdentifiableAndVersionedEntity {

    public static final String DTO_ENTITY_GRAPH = "henkiloDto";
    public static final String DUPLICATE_RESULT_MAPPING = "henkiloDuplicateMapping";

    @Column(name = "oidhenkilo", nullable = false)
    private String oidHenkilo;

    /**
     * Henkilön nykyinen hetu (voi olla yksilöity tai yksilöimätön).
     */
    @Column(unique = true)
    private String hetu;

    /**
     * Henkilön kaikki viralliset hetut (nykyinen ja joskus käytössä olleet).
     * Huom! Ei sisällä yksilöimättömien henkilöiden hetuja.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "henkilo_hetu",
            joinColumns = @JoinColumn(name = "henkilo_id"),
            foreignKey = @ForeignKey(name = "fk_henkilo_hetu_henkilo"),
            uniqueConstraints = @UniqueConstraint(name = "uk_henkilo_hetu_01", columnNames = "hetu"))
    @Column(name = "hetu", nullable = false)
    @NotAudited
    private Set<String> kaikkiHetut;

    @Column(nullable = false)
    private String etunimet;

    @Column(nullable = false)
    private String kutsumanimi;

    @Column(nullable = false)
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
    @Column(name = "yksiloity", nullable = false)
    private boolean yksiloity;

    /**
     * true jos hetullinen henkilö on automaattisesti yksilöity VTJ:stä.
     */
    @Column(nullable = false)
    private boolean yksiloityVTJ;

    @Column(name = "yksiloityeidas", nullable = false)
    private boolean yksiloityEidas;

    public boolean isYksiloityWithAnyMethod() {
        return yksiloity || isYksiloityVahvasti();
    }

    public boolean isYksiloityVahvasti() {
        return yksiloityVTJ || yksiloityEidas;
    }

    @Column(name = "vtj_bucket")
    private Long vtjBucket;

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
    @JoinTable(name = "henkilo_kansalaisuus", joinColumns = @JoinColumn(name = "henkilo_id",
            referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(
            name = "kansalaisuus_id", referencedColumnName = "id"))
    @BatchSize(size = 1000)
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

    @Enumerated(EnumType.STRING)
    @Column(name = "kuolinsiivous")
    private CleanupStep cleanupStep;

    private String kotikunta; // kunta-koodisto

    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, orphanRemoval = true)
    @JoinColumn(name = "henkilo_id", nullable = false)
    @NotAudited
    private Set<Identification> identifications = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, orphanRemoval = true)
    @JoinColumn(name = "henkilo_id", nullable = false)
    @NotAudited
    private List<EidasTunniste> eidasTunnisteet;

    @Column(nullable = false)
    private Boolean turvakielto = Boolean.FALSE;

    /**
     * Oppijan organisaatiot. Huom! virkailijan organisaatiot ovat
     * käyttöoikeuspalvelussa.
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
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

    @OneToMany(mappedBy = "lapsi", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @NotAudited
    private Set<HenkiloHuoltajaSuhde> huoltajat = new HashSet<>();

    /**
     * If turvaKielto is flagged certain data should be removed from database
     * <a href="https://jira.eduuni.fi/browse/KJHH-2231">...</a>
     */
    @PreUpdate
    @PrePersist
    void handleTurvaKielto() {
        if (Boolean.TRUE.equals(this.turvakielto)) {
            yhteystiedotRyhma.removeIf(isFromVTJ());
        }
    }

    private static Predicate<YhteystiedotRyhma> isFromVTJ() {
        return a -> a.getRyhmaAlkuperaTieto().equals("alkupera1");
    }

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

    public Boolean isTurvakielto() {
        return turvakielto;
    }

    public void setTurvakielto(Boolean turvakielto) {
        this.turvakielto = turvakielto;
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
        if (isYksiloityWithAnyMethod()) {
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

    public boolean addHetu(String... hetut) {
        if (this.kaikkiHetut == null) {
            this.kaikkiHetut = new HashSet<>();
        }
        return this.kaikkiHetut.addAll(asList(hetut));
    }

    public boolean removeHetu(String... hetut) {
        if (this.kaikkiHetut == null) {
            this.kaikkiHetut = new HashSet<>();
        }
        return this.kaikkiHetut.removeAll(asList(hetut));
    }

    public void clearHetut() {
        if (this.kaikkiHetut != null) {
            this.kaikkiHetut.clear();
        }
    }

    // Initialize default values for lombok builder
    public static class builder {
        private Boolean yksiloity = false;
        private Boolean yksiloityVTJ = false;
        private Boolean yksilointiYritetty = false;
        private Boolean duplicate = false;
        private Boolean eiSuomalaistaHetua = false;
        private Boolean turvakielto = false;

        private String sukupuoli = "1";
    }

    // Preserves the existing list because orphan removal.
    public void setHuoltajat(Set<HenkiloHuoltajaSuhde> huoltajat) {
        if (this.huoltajat != null) {
            this.huoltajat.clear();
        } else {
            this.huoltajat = new HashSet<>();
        }
        this.huoltajat.addAll(huoltajat);
    }

    public Set<HenkiloHuoltajaSuhde> getHuoltajat() {
        return this.huoltajat;
    }

    public void clearHuoltajat() {
        if (this.huoltajat != null) {
            this.huoltajat.clear();
        }
    }

    public String getOppijanumero() {
        if (isYksiloityWithAnyMethod()) {
            return oidHenkilo;
        }

        return null;
    }

    public void setKutsumanimi(String kutsumanimi) {
        this.kutsumanimi = kutsumanimi;
        if (!StringUtils.hasLength(this.kutsumanimi)) {
            this.kutsumanimi = this.etunimet;
        }
    }


}
