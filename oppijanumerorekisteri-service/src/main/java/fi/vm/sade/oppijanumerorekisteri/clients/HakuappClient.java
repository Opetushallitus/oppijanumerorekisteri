package fi.vm.sade.oppijanumerorekisteri.clients;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface HakuappClient {
    Map<String, List<Map<String, Object>>> fetchApplicationsByOid(Set<String> oids);
}