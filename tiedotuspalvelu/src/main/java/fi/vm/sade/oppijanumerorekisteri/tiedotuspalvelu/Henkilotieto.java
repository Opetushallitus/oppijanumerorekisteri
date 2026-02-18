package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Henkilotieto(String hetu, String katuosoite, String postinumero, String kaupunki) {}
