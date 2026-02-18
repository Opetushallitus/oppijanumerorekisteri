package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Henkilotieto(
    String hetu,
    String etunimet,
    String sukunimi,
    String katuosoite,
    String postinumero,
    String kaupunki) {}
