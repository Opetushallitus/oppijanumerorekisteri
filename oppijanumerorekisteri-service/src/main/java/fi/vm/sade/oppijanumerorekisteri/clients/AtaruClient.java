package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;

import java.util.List;
import java.util.Map;

public interface AtaruClient {
    Map<String, List<HakemusDto>> fetchApplicationsByOid(List<String> oids);
}
