package fi.vm.sade.oppijanumerorekisteri.configurations.security;

import org.apereo.cas.client.session.SessionMappingStorage;

public interface OphSessionMappingStorage extends SessionMappingStorage {

    void clean();

}