package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplikaattiCriteria;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public interface DuplicateService {
    List<HenkiloDuplicateDto> findDuplicates(String oid);

    List<HakemusDto> getApplications(String oid);

    List<HenkiloDuplicateDto> getDuplikaatit(HenkiloDuplikaattiCriteria criteria);

    LinkResult removeDuplicateHetuAndLink(Henkilo henkilo, String hetu);

    LinkResult linkWithHetu(Henkilo henkilo, String hetu);

    LinkResult linkHenkilos(String henkiloOid, List<String> similarHenkiloOids);

    LinkResult unlinkHenkilo(String oid, String slaveOid);

    @AllArgsConstructor
    class LinkResult {
        public final Henkilo master;
        private final List<Henkilo> modified;
        private final List<String> slaveOids;

        public void forEachModified(Consumer<? super Henkilo> consumer) {
            this.modified.forEach(consumer);
        }

        public List<String> getSlaveOids() {
            return new ArrayList<>(slaveOids);
        }
    }
}
