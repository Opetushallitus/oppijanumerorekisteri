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

    /**
     * Jos henkilöstä löytyy samalla hetulla toinen henkilö nämä yhdistetään ja hetutiedot siirretään annetulle henkilölle.
     * Liittyy vahvan tunnistuksen ja kutsuprosessiin tilanteessa jossa tunnus pitää liittää olemassa olevaan yksilöityyn
     * henkilöön.
     * Huom. Tätä ei ole tarkoitettu kutsuttavaksi muualta kuin palvelukerrokselta olemassa olevan transaktion sisällä!
     * @param henkilo Henkilö jolle hetu annetaan
     * @param hetu Henkilölle annettava henkilötunnus
     * @return Linkitystiedot
     */
    LinkResult removeDuplicateHetuAndLink(Henkilo henkilo, String hetu);

    /**
     * Linkittää hetulla mahdollisesti löytyvän hetullisen henkilön annettuun henkilöön. Jos ennestään löytyvä henkilö on
     * yksilöity tämä henkilö saa hetun.
     * Huom. Tätä ei ole tarkoitettu kutsuttavaksi muualta kuin palvelukerrokselta olemassa olevan transaktion sisällä!
     * @param henkilo Kandidaatti hetun saajaksi
     * @param hetu Henkilölle annettava henkilötunnus
     * @return Linkitystiedot
     */
    LinkResult linkWithHetu(Henkilo henkilo, String hetu);

    /**
     * Linkittää henkilölle joukon duplikaattihenkilöitä. Jos henkilöä ei ole yksilöity ja joku linkitettävistä henkilöistä
     * on tämä valitaan uudeksi masteriksi. Korjaa mahdolliset vanhat linkitykset mukaan kaksitasoisesti (master-slave).
     * Huom. Tätä ei ole tarkoitettu kutsuttavaksi muualta kuin palvelukerrokselta olemassa olevan transaktion sisällä!
     * @param henkiloOid Kandidaatti master henkilöksi
     * @param similarHenkiloOids Joukko linkitettäviä duplikaattihenkilöitä.
     * @return Linkitystiedot
     */
    LinkResult linkHenkilos(String henkiloOid, List<String> similarHenkiloOids);

    /**
     * Purkaa kahden henkilön duplikaattilinkityksen.
     * Huom. Tätä ei ole tarkoitettu kutsuttavaksi muualta kuin palvelukerrokselta olemassa olevan transaktion sisällä!
     * @param oid Master henkilön oid
     * @param slaveOid Duplikaattihenkilön oid
     * @return Linkitystiedot
     */
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
