package fi.vm.sade.oppijanumerorekisteri.services.vtj;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.utils.VtjYhteystiedotRyhma;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Component
public class PerustietoMapper extends TietoryhmaMapper {
    public PerustietoMapper(KoodistoService koodistoService) {
        super(koodistoService);
    }

    @Override
    public HenkiloForceUpdateDto mutateUpdateDto(HenkiloForceUpdateDto update, JsonNode tietoryhma, String locale) {
        switch (getStringValue(tietoryhma, "tietoryhma")) {
            case "HENKILON_NIMI":
                update.setEtunimet(getStringValue(tietoryhma, "etunimi"));
                update.setSukunimi(getStringValue(tietoryhma, "sukunimi"));
                break;
            case "KUOLINPAIVA":
                setKuolinpaiva(update, tietoryhma);
                break;
            case "SYNTYMAPAIVA":
                update.setSyntymaaika(parseDate(tietoryhma.get("syntymapv")));
                break;
            case "SUKUPUOLI":
                update.setSukupuoli(getSukupuoli(tietoryhma));
                break;
            case "KANSALAISUUS":
                update.setKansalaisuus(getKansalaisuus(tietoryhma));
                break;
            case "AIDINKIELI":
                update.setAidinkieli(getKielisyys(tietoryhma));
                break;
            case "KUTSUMANIMI":
                if ("NYKYINEN_KUTSUMANIMI".equals(getStringValue(tietoryhma, "nimilaji"))) {
                    update.setKutsumanimi(getStringValue(tietoryhma, "nimi"));
                }
                break;
            case "TURVAKIELTO":
                update.setTurvakielto(tietoryhma.get("turvakieltoAktiivinen").asBoolean());
                break;
            case "KOTIKUNTA":
                update.setKotikunta(getStringValue(tietoryhma, "kuntakoodi"));
                break;
            case "EDELLINEN_KOTIKUNTA":
                break;
            case "SAHKOPOSTIOSOITE":
                if (!isTurvakiellonAlainen(tietoryhma)
                        && tietoryhma.get("sahkopostiosoite") != null) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.SAHKOPOSTIOSOITE);
                    setYhteystietoArvo(yhteystiedotRyhma,
                            YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, getStringValue(tietoryhma, "sahkopostiosoite"));
                }
                break;
            case "KOTIMAINEN_POSTIOSOITE":
                if (!isTurvakiellonAlainen(tietoryhma)) {
                    setKotimainenPostiosoite(update, tietoryhma, locale);
                }
                break;
            case "VAKINAINEN_KOTIMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.VAKINAINEN_KOTIMAINEN_OSOITE);
                    setKotimainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "VAKINAINEN_ULKOMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.VAKINAINEN_ULKOMAINEN_OSOITE);
                    setUlkomainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "TILAPAINEN_KOTIMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.TILAPAINEN_KOTIMAINEN_OSOITE);
                    setKotimainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "TILAPAINEN_ULKOMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.TILAPAINEN_ULKOMAINEN_OSOITE);
                    setUlkomainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "HUOLTAJA":
                addOrUpdateHuoltaja(update.getHuoltajat(), tietoryhma);
                break;
            default:
                log.debug("did not know how to handle tietoryhma " + getStringValue(tietoryhma, "tietoryhma"));
                break;
        }
        return update;
    }

    @Override
    public KotikuntahistoriaChanges mapToKotikuntahistoriaChanges(Henkilo henkilo, JsonNode tietoryhmat, List<KotikuntaHistoria> kotikuntahistoria) {
        var changes = new KotikuntahistoriaChanges();
        for (var i = 0; i < tietoryhmat.size(); i++) {
            var tietoryhma = tietoryhmat.get(i);
            switch (getStringValue(tietoryhma, "tietoryhma")) {
                case "KOTIKUNTA":
                case "EDELLINEN_KOTIKUNTA":
                    changes.updates().add(new KotikuntaHistoria(
                            henkilo.getId(),
                            getStringValue(tietoryhma, KOTIKUNTA_KUNTAKOODI),
                            getDateValue(tietoryhma, KOTIKUNTA_KUNTAANMUUTTOPV),
                            getDateValue(tietoryhma, KOTIKUNTA_KUNNASTAPOISMUUTTOPV)
                    ));
                    break;
            }
        }
        return changes;
    }

}
