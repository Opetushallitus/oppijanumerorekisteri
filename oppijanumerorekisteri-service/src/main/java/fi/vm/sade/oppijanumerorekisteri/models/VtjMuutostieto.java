package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import org.hibernate.annotations.Type;

import com.fasterxml.jackson.databind.JsonNode;

import io.hypersistence.utils.hibernate.type.json.JsonType;
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
public class VtjMuutostieto extends IdentifiableAndVersionedEntity {
    @Column(nullable = false)
    public String henkilotunnus;

    @Column(nullable = false)
    public LocalDateTime muutospv;

    @Type(JsonType.class)
    @Column(nullable = false, columnDefinition = "jsonb")
    public JsonNode tietoryhmat;

    @Column(nullable = true)
    public LocalDateTime processed;

    @Column(nullable = false)
    public Boolean error;
}
