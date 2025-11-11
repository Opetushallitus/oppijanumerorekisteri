package fi.vm.sade.oppijanumerorekisteri.utils;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

public class DtoUtils {
    public static ZonedDateTime toZonedDateTime(Date date) {
        if (date == null) return null;
        var utc = ZonedDateTime.ofInstant(date.toInstant(), ZoneId.of("UTC"));
        return utc.withZoneSameInstant(ZoneId.of("Europe/Helsinki"));
    }
}
