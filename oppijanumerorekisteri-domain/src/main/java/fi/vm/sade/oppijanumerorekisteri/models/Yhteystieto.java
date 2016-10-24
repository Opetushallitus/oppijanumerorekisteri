package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "yhteystiedot")
public class Yhteystieto extends IdentifiableAndVersionedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yhteystiedotryhma_id", nullable = false, unique = false)
    private YhteystiedotRyhma yhteystiedotRyhma;
    
    @Column(name = "yhteystieto_tyyppi")
    @Enumerated(EnumType.STRING)
    private YhteystietoTyyppi yhteystietoTyyppi;
    
    @Column(name = "yhteystieto_arvo")
    private String yhteystietoArvo;
}
