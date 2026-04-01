package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import java.time.OffsetDateTime;
import java.util.Map;

public record Event(String type, OffsetDateTime eventTime, Map<String, Object> metadata) {}
