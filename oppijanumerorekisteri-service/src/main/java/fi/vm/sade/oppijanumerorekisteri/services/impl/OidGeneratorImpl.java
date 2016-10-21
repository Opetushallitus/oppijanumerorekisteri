package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import org.springframework.stereotype.Component;
import fi.vm.sade.oidgenerator.OIDGenerator;

@Component
public class OidGeneratorImpl implements OidGenerator {
    public String generateOID() {
        return OIDGenerator.generateOID(OIDGenerator.HENKILO_OID_NODE); // <- 1.2.246.562.24 is the OID node for a persons.
    }
}
