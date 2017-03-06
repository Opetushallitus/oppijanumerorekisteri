package fi.vm.sade.oppijanumerorekisteri.models;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import static java.util.Objects.requireNonNull;
import java.util.Set;

/**
 * Yhteystietojen ryhmä (esimerkiksi kotiosoite tai työosoite).
 *
 * @see Henkilo#yhteystiedotRyhma henkilön yhteystietoryhmät
 */
@Getter
@Setter
@Entity
@Table(name = "yhteystiedotryhma")
public class YhteystiedotRyhma extends IdentifiableAndVersionedEntity {

    private static final long serialVersionUID = 4229306351772426723L;

    /**
     * Koodisto "yhteystietotyypit".
     */
    @Column(name = "ryhmakuvaus")
    private String ryhmaKuvaus;

    /**
     * Koodisto "yhteystietojenalkupera".
     */
    @Column(name = "ryhma_alkuperatieto")
    private String ryhmaAlkuperaTieto;

    @Column(name = "read_only", nullable = false)
    private boolean readOnly;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "yhteystiedotryhma_id", nullable = false)
    private Set<Yhteystieto> yhteystieto = new HashSet<>();

    public boolean isEquivalentTo(YhteystiedotRyhmaDto dto) {
        // kuvaus + alkuperä ei ole uniikki joten pakko turvautua id:hen
        return getId().equals(dto.getId());
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private Long id;
        private String ryhmaKuvaus;
        private String ryhmaAlkuperaTieto;
        private boolean readOnly;
        private final Set<Yhteystieto> yhteystieto = new HashSet<>();

        public Builder id(Long id) {
            this.id = requireNonNull(id);
            return this;
        }

        public Builder ryhmaKuvaus(String ryhmaKuvaus) {
            this.ryhmaKuvaus = requireNonNull(ryhmaKuvaus);
            return this;
        }

        public Builder ryhmaAlkuperaTieto(String ryhmaAlkuperaTieto) {
            this.ryhmaAlkuperaTieto = requireNonNull(ryhmaAlkuperaTieto);
            return this;
        }

        public Builder readOnly(boolean readOnly) {
            this.readOnly = readOnly;
            return this;
        }

        public Builder yhteystieto(Yhteystieto yhteystieto) {
            this.yhteystieto.add(requireNonNull(yhteystieto));
            return this;
        }

        public Builder yhteystieto(Set<Yhteystieto> yhteystieto) {
            this.yhteystieto.addAll(requireNonNull(yhteystieto));
            return this;
        }

        public YhteystiedotRyhma build() {
            YhteystiedotRyhma entity = new YhteystiedotRyhma();
            entity.setId(id);
            entity.setRyhmaKuvaus(ryhmaKuvaus);
            entity.setRyhmaAlkuperaTieto(ryhmaAlkuperaTieto);
            entity.setReadOnly(readOnly);
            entity.setYhteystieto(yhteystieto);
            return entity;
        }

    }
}
