package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oidgenerator.OIDGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OidGeneratorImpl implements OidGenerator {
    @Value("${oppijanumerorekisteri.henkilo.solmuluokka}")
    private String solmuluokka;

    public String generateOID() {
        return OIDGenerator.generateOID(Integer.parseInt(solmuluokka));
    }
}
