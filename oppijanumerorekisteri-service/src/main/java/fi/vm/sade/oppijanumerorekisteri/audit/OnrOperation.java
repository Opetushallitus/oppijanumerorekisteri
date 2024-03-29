package fi.vm.sade.oppijanumerorekisteri.audit;

import fi.vm.sade.auditlog.Operation;

public enum OnrOperation implements Operation {
    CREATE_HENKILO,
    READ,
    UPDATE_HENKILO,
    FORCE_UPDATE_HENKILO,
    PASSIVOI_HENKILO,
    TUNNISTUSTIETOJEN_PAIVITYS,
    YKSILOINTITIETOJEN_PAIVITYS,
    MANUAALINEN_YKSILOINTI,
    YKSILOINTI_PAALLE,
    YKSILOINTI_POIS_PAALTA,
    HETUTTOMAN_YKSILOINTI,
    PURA_HETUTTOMAN_YKSILOINTI,
    OPPIJOIDEN_TUONTI,
    LINKITYS,
    PURA_LINKITYS,
}
