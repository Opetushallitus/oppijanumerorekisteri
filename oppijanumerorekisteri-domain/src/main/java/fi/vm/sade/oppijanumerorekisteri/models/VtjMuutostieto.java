package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "vtj_muutostieto")
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class VtjMuutostieto extends IdentifiableAndVersionedEntity {
    @Column(nullable = false)
    public String henkilotunnus;

    @Column(nullable = false)
    public LocalDateTime muutospv;

    @Type(type = "jsonb")
    @Column(nullable = false, columnDefinition = "jsonb")
    public JsonNode tietoryhmat;
}
