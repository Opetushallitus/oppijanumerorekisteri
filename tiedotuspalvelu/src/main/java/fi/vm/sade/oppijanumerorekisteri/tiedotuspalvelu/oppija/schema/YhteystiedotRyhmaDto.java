package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija.schema;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YhteystiedotRyhmaDto(
    @JsonProperty("ryhmaKuvaus") String yhteystietotyypitKoodiarvo,
    List<YhteystietoDto> yhteystieto) {
  public static final String YHTEYSTIETOTYYPIT_VTJ_VAKINAINEN_KOTIMAINEN_OSOITE =
      "yhteystietotyyppi4";

  @JsonIgnore
  public boolean isVtjVakinainenKotimainenOsoite() {
    return YHTEYSTIETOTYYPIT_VTJ_VAKINAINEN_KOTIMAINEN_OSOITE.equals(yhteystietotyypitKoodiarvo);
  }
}
