package fi.vm.sade.oppijanumerorekisteri.services;

public interface OppijanumerorekisteriBusinessService {
    Boolean getHasHetu(String oid);
    boolean getOidExists(String oid);
    String getOidByHetu(String hetu);
}
