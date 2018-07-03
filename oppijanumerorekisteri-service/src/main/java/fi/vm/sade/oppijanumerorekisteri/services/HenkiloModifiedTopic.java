package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

public interface HenkiloModifiedTopic extends Topic<Henkilo> {
    void publish(Henkilo henkilo);
}
