package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplikaattiCriteria;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface DuplicateService {
    List<HenkiloDuplicateDto> findDuplicates(String oid);

    List<HakemusDto> getApplications(String oid);

    List<HenkiloDuplicateDto> getDuplikaatit(HenkiloDuplikaattiCriteria criteria);

    void removeDuplicateHetuAndLink(String oidHenkilo, String hetu);

    Henkilo linkWithHetu(Henkilo henkilo, String hetu);

    List<String> linkHenkilos(String henkiloOid, List<String> similarHenkiloOids);

    void unlinkHenkilo(String oid, String slaveOid);
}
