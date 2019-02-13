package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

public interface HenkiloModifiedTopic extends Topic<Henkilo> {
    void publish(Henkilo henkilo);
}
