package fi.vm.sade.oppijanumerorekisteri.repositories;

import java.util.List;

public interface OrganisaatioRepositoryCustom {

    List<String> findOidByHenkiloOid(String henkiloOid);

}
