package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YleistunnisteDto;

public interface YleistunnisteService {

    YleistunnisteDto hae(HenkiloExistenceCheckDto details);

    OppijaReadDto tarkista(String oid);
}
