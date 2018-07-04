package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplikaattiCriteria;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.ArrayList;
import java.util.List;

public interface DuplicateService {
    List<HenkiloDuplicateDto> findDuplicates(String oid);

    List<HakemusDto> getApplications(String oid);

    List<HenkiloDuplicateDto> getDuplikaatit(HenkiloDuplikaattiCriteria criteria);

    LinkResult removeDuplicateHetuAndLink(Henkilo henkilo, String hetu);

    LinkResult linkWithHetu(Henkilo henkilo, String hetu);

    LinkResult linkHenkilos(String henkiloOid, List<String> similarHenkiloOids);

    LinkResult unlinkHenkilo(String oid, String slaveOid);

    class LinkResult {
        public final Henkilo master;
        public final List<Henkilo> modified;
        public final List<String> slaveOids;

        public LinkResult(Henkilo master, List<Henkilo> modified, List<String> slaveOids) {
            this.master = master;
            this.modified = modified;
            this.slaveOids = slaveOids;
        }
    }
}
