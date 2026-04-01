package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija.schema;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.Builder;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record HenkiloDto(
    String oppijanumero,
    String hetu,
    String etunimet,
    String sukunimi,
    List<YhteystiedotRyhmaDto> yhteystiedotRyhma) {}
