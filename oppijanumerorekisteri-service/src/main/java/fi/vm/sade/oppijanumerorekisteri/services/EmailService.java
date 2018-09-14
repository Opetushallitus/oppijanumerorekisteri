package fi.vm.sade.oppijanumerorekisteri.services;

import java.util.Set;

public interface EmailService {
    void sendTuontiKasiteltyWithErrorsEmail(Set<String> emails);
}
