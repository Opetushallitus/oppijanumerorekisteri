package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija.schema;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YhteystietoDto(String yhteystietoTyyppi, String yhteystietoArvo) {}
