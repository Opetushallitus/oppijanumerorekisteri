package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;

import java.util.Optional;

public interface VtjClient {
    Optional<YksiloityHenkilo> fetchHenkilo(String hetu);
}
