package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;

public interface VtjClient {
    YksiloityHenkilo fetchHenkilo(String hetu);
}
