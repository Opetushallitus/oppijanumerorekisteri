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
@NoArgsConstructor
@AllArgsConstructor
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

    public static RyhmaKuvausBuilder builder() {
        return new Builder();
    }

    public static interface RyhmaKuvausBuilder {

        RyhmaAlkuperaTietoBuilder ryhmaKuvaus(String ryhmaKuvaus);

    }

    public static interface RyhmaAlkuperaTietoBuilder {

        YhteystiedotRyhmaBuilder ryhmaAlkuperaTieto(String ryhmaAlkuperaTieto);

    }

    public static interface YhteystiedotRyhmaBuilder {

        YhteystiedotRyhmaBuilder id(Long id);

        YhteystiedotRyhmaBuilder readOnly(boolean readOnly);

        YhteystiedotRyhmaBuilder yhteystieto(Yhteystieto yhteystieto);

        YhteystiedotRyhmaBuilder yhteystieto(Set<Yhteystieto> yhteystieto);

        YhteystiedotRyhma build();

    }

    private static class Builder implements RyhmaKuvausBuilder, RyhmaAlkuperaTietoBuilder, YhteystiedotRyhmaBuilder {

        private Long id;
        private String ryhmaKuvaus;
        private String ryhmaAlkuperaTieto;
        private boolean readOnly;
        private final Set<Yhteystieto> yhteystieto = new HashSet<>();

        @Override
        public Builder id(Long id) {
            this.id = requireNonNull(id);
            return this;
        }

        @Override
        public RyhmaAlkuperaTietoBuilder ryhmaKuvaus(String ryhmaKuvaus) {
            this.ryhmaKuvaus = requireNonNull(ryhmaKuvaus);
            return this;
        }

        @Override
        public YhteystiedotRyhmaBuilder ryhmaAlkuperaTieto(String ryhmaAlkuperaTieto) {
            this.ryhmaAlkuperaTieto = requireNonNull(ryhmaAlkuperaTieto);
            return this;
        }

        @Override
        public YhteystiedotRyhmaBuilder readOnly(boolean readOnly) {
            this.readOnly = readOnly;
            return this;
        }

        @Override
        public YhteystiedotRyhmaBuilder yhteystieto(Yhteystieto yhteystieto) {
            this.yhteystieto.add(requireNonNull(yhteystieto));
            return this;
        }

        @Override
        public YhteystiedotRyhmaBuilder yhteystieto(Set<Yhteystieto> yhteystieto) {
            this.yhteystieto.addAll(requireNonNull(yhteystieto));
            return this;
        }

        @Override
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
