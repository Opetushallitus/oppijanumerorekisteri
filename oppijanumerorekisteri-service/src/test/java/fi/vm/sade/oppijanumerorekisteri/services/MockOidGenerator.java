package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oidgenerator.OIDGenerator;

public class MockOidGenerator implements OidGenerator {
    private static long number = 1000000000L;

    public String generateOID() {
        return OIDGenerator.makeOID(OIDGenerator.HENKILO_OID_NODE, number++);
    }
}
