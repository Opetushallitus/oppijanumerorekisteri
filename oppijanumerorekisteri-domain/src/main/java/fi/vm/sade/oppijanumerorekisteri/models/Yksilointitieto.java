package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "yksilointitieto")
@Entity
public class Yksilointitieto extends IdentifiableAndVersionedEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "henkiloid", nullable = false, unique = true)
    private Henkilo henkilo;

    private String hetu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    private String sukupuoli;

    private String kotikunta;

    private boolean turvakielto;

    @ManyToOne
    @JoinColumn(name = "aidinkieli_id")
    private Kielisyys aidinkieli;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "yksilointi_kansalaisuus",
            joinColumns = @JoinColumn(name = "yksilointitieto_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "kansalaisuus_id", referencedColumnName = "id"))
    private Set<Kansalaisuus> kansalaisuus = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "yksilointitieto_id")
    private Set<YhteystiedotRyhma> yhteystiedotRyhma = new HashSet<>();

    public void clearYhteystiedotRyhma() {
        this.yhteystiedotRyhma.clear();
    }

    public void addKansalaisuus(Kansalaisuus kansalaisuus) {
        this.kansalaisuus.add(kansalaisuus);
    }

    public void addYhteystiedotRyhma(YhteystiedotRyhma yhteystiedotRyhma) {
        this.yhteystiedotRyhma.add(yhteystiedotRyhma);
    }

}
