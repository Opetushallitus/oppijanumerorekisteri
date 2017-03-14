package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

public interface YksilointiService {
    Henkilo yksiloiManuaalisesti(final String henkiloOid);
}
