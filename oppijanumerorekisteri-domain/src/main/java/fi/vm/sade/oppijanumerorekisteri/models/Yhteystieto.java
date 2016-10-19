package fi.vm.sade.oppijanumerorekisteri.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "yhteystiedot")
public class Yhteystieto extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yhteystiedotryhma_id", nullable = false, unique = false)
    @JsonIgnore
    private YhteystiedotRyhma yhteystiedotRyhma;
    
    @Column(name = "yhteystieto_tyyppi")
    @Enumerated(EnumType.STRING)
    private YhteystietoTyyppi yhteystietoTyyppi;
    
    @Column(name = "yhteystieto_arvo")
    private String yhteystietoArvo;
}
