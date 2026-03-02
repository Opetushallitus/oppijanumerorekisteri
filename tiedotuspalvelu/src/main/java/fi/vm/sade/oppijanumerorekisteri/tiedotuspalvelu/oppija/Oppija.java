package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Oppija(
    String hetu,
    String etunimet,
    String sukunimi,
    String katuosoite,
    String postinumero,
    String kaupunki) {}
