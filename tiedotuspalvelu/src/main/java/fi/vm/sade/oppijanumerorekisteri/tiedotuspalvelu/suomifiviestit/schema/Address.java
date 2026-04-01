package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Address(
    String name,
    String streetAddress,
    String zipCode,
    String city,
    String countryCode,
    String additionalName) {}
