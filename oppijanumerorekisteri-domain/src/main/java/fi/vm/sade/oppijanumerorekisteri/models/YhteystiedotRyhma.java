package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "yhteystiedotryhma")
public class YhteystiedotRyhma extends IdentifiableAndVersionedEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "henkilo_id")
    private Henkilo henkilo;
    
    @Column(name = "ryhmakuvaus")
    private String ryhmaKuvaus;
    
    @Column(name = "ryhma_alkuperatieto")
    private String ryhmaAlkuperaTieto;
    
    @Column(name = "read_only", nullable = false)
    private boolean readOnly;
    
    @OneToMany(mappedBy = "yhteystiedotRyhma", cascade = CascadeType.ALL, fetch= FetchType.LAZY)
    private Set<Yhteystieto> yhteystieto = new HashSet<>();
}
