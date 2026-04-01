package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import java.util.List;

public record EventsResponse(String continuationToken, List<Event> events) {}
