package fi.vm.sade.oppijanumerorekisteri.repositories;

import java.util.List;

public interface OrganisaatioRepositoryCustom {

    /**
     * Finds all organisaatio oids for a given henkilo oid. This includes the organisaatio oids of the henkilo and
     * the organisaatio oids of the henkilo's viitteet.
     * @param henkiloOid the henkilo oid
     * @return a list of organisaatio oids
     */
    List<String> findOidByHenkiloOid(String henkiloOid);

}
