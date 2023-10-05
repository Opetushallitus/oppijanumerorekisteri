package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;

import fi.vm.sade.oppijanumerorekisteri.dto.TuontiApi;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Oppijoita tuodaan oppijanumerorekisteriin oppilashallintojärjestelmistä
 * eräajona. Tämä kerää yhteen tuodut oppijat yhdestä eräajosta.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tuonti")
public class Tuonti extends IdentifiableAndVersionedEntity {

    /**
     * Sähköposti yhteydenottoa varten.
     */
    @Column(name = "sahkoposti")
    private String sahkoposti;

    /**
     * Käsittelemätön data.
     */
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "data_id", foreignKey = @ForeignKey(name = "fk_tuonti_tuonti_data"))
    private TuontiData data;

    /**
     * Käsiteltävien rivien määrä.
     */
    @Column(name = "kasiteltavia", nullable = false)
    private int kasiteltavia;

    /**
     * Käsiteltyjen rivien määrä.
     */
    @Column(name = "kasiteltyja", nullable = false)
    private int kasiteltyja;

    @Column(name = "kasittelija_oid")
    private String kasittelijaOid;

    @Column(name = "aikaleima", nullable = false, insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Temporal(TemporalType.TIMESTAMP)
    private Date aikaleima;
    /*
     * Yksilöintipuutteisiin liittyvä ilmoitustarve käsitelty
     */
    @Column(name = "ilmoitustarve_kasitelty")
    private boolean ilmoitustarveKasitelty;

    @Enumerated(EnumType.STRING)
    @Column(name = "api")
    private TuontiApi api;

    /**
     * Käsitelty data.
     */
    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tuonti_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tuonti_rivi_tuonti"))
    private Set<TuontiRivi> henkilot = new HashSet<>();

    /**
     * Organisaatiot joihin oppijat liitetään.
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH })
    @JoinTable(name = "tuonti_organisaatio",
            joinColumns = @JoinColumn(name = "tuonti_id", referencedColumnName = "id"),
            foreignKey = @ForeignKey(name = "fk_tuonti_organisaatio_tuonti"),
            inverseJoinColumns = @JoinColumn(name = "organisaatio_id", referencedColumnName = "id"),
            inverseForeignKey = @ForeignKey(name = "fk_tuonti_organisaatio_organisaatio"))
    private Set<Organisaatio> organisaatiot;

    public boolean isKasitelty() {
        return kasiteltyja >= kasiteltavia;
    }

}
