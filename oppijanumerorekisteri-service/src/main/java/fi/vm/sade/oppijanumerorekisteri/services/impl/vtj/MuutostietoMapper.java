package fi.vm.sade.oppijanumerorekisteri.services.impl.vtj;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.utils.VtjYhteystiedotRyhma;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class MuutostietoMapper extends TietoryhmaMapper {
    public MuutostietoMapper(KoodistoService koodistoService) {
        super(koodistoService);
    }

    private boolean isDataUpdate(JsonNode tietoryhma) {
        String muutosattribuutti = getStringValue(tietoryhma, "muutosattribuutti");
        if (List.of("LISATTY", "KORJATTU", "MUUTETTU").contains(muutosattribuutti)) {
            LocalDate loppupv = parseDate(tietoryhma.get("loppupv"));
            return loppupv == null || loppupv.isAfter(LocalDate.now());
        }

        return false;
    }

    @Override
    public HenkiloForceUpdateDto mutateUpdateDto(HenkiloForceUpdateDto update, JsonNode tietoryhma, String locale) {
        switch (getStringValue(tietoryhma, "tietoryhma")) {
            case "HENKILON_NIMI":
                if (isDataUpdate(tietoryhma)) {
                    update.setEtunimet(getStringValue(tietoryhma, "etunimi"));
                    update.setSukunimi(getStringValue(tietoryhma, "sukunimi"));
                }
                break;
            case "HENKILOTUNNUS_KORJAUS":
                if (isDataUpdate(tietoryhma) && getStringValue(tietoryhma, "aktiivinenHenkilotunnus") != null) {
                    update.setHetu(getStringValue(tietoryhma, "aktiivinenHenkilotunnus"));
                }
                break;
            case "KUOLINPAIVA":
                setKuolinpaiva(update, tietoryhma);
                break;
            case "SYNTYMAPAIVA":
                if (isDataUpdate(tietoryhma)) {
                    update.setSyntymaaika(parseDate(tietoryhma.get("syntymapv")));
                }
                break;
            case "SUKUPUOLI":
                if (isDataUpdate(tietoryhma)) {
                    update.setSukupuoli(getSukupuoli(tietoryhma));
                }
                break;
            case "KANSALAISUUS":
                update.setKansalaisuus(getKansalaisuus(tietoryhma));
                break;
            case "AIDINKIELI":
                if (isDataUpdate(tietoryhma)) {
                    update.setAidinkieli(getKielisyys(tietoryhma));
                }
                break;
            case "KUTSUMANIMI":
                if (isDataUpdate(tietoryhma)
                        && "NYKYINEN_KUTSUMANIMI".equals(getStringValue(tietoryhma, "nimilaji"))) {
                    update.setKutsumanimi(getStringValue(tietoryhma, "nimi"));
                }
                break;
            case "TURVAKIELTO":
                boolean turvakielto = tietoryhma.get("turvakieltoAktiivinen").asBoolean();
                update.setTurvakielto(turvakielto);
                if (turvakielto) {
                    removeAllYhteystietoryhmas(update.getYhteystiedotRyhma());
                    update.setKotikunta(null);
                }
                break;
            case "KOTIKUNTA":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    update.setKotikunta(null);
                } else if (isDataUpdate(tietoryhma)) {
                    update.setKotikunta(getStringValue(tietoryhma, "kuntakoodi"));
                }
                break;
            case "SAHKOPOSTIOSOITE":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    removeYhteystietoryhma(update.getYhteystiedotRyhma(), VtjYhteystiedotRyhma.SAHKOPOSTIOSOITE);
                } else if (isDataUpdate(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.SAHKOPOSTIOSOITE);
                    setYhteystietoArvo(yhteystiedotRyhma,
                            YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, getStringValue(tietoryhma, "sahkopostiosoite"));
                }
                break;
            case "KOTIMAINEN_POSTIOSOITE":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    removeYhteystietoryhma(update.getYhteystiedotRyhma(), VtjYhteystiedotRyhma.KOTIMAINEN_POSTIOSOITE);
                } else if (isDataUpdate(tietoryhma)) {
                    setKotimainenPostiosoite(update, tietoryhma, locale);
                }
                break;
            case "VAKINAINEN_KOTIMAINEN_OSOITE":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    removeYhteystietoryhma(update.getYhteystiedotRyhma(),
                            VtjYhteystiedotRyhma.VAKINAINEN_KOTIMAINEN_OSOITE);
                } else if (isDataUpdate(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.VAKINAINEN_KOTIMAINEN_OSOITE);
                    setKotimainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "VAKINAINEN_ULKOMAINEN_OSOITE":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    removeYhteystietoryhma(update.getYhteystiedotRyhma(),
                            VtjYhteystiedotRyhma.VAKINAINEN_ULKOMAINEN_OSOITE);
                } else if (isDataUpdate(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.VAKINAINEN_ULKOMAINEN_OSOITE);
                    setUlkomainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "TILAPAINEN_KOTIMAINEN_OSOITE":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    removeYhteystietoryhma(update.getYhteystiedotRyhma(),
                            VtjYhteystiedotRyhma.TILAPAINEN_KOTIMAINEN_OSOITE);
                } else if (isDataUpdate(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.TILAPAINEN_KOTIMAINEN_OSOITE);
                    setKotimainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "TILAPAINEN_ULKOMAINEN_OSOITE":
                if (isTurvakiellonAlainen(tietoryhma)) {
                    removeYhteystietoryhma(update.getYhteystiedotRyhma(),
                            VtjYhteystiedotRyhma.TILAPAINEN_ULKOMAINEN_OSOITE);
                } else if (isDataUpdate(tietoryhma)) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.TILAPAINEN_ULKOMAINEN_OSOITE);
                    setUlkomainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "HUOLTAJA":
                JsonNode huoltajaJson = tietoryhma.get("voimassaolevatTiedot") != null
                        && tietoryhma.get("voimassaolevatTiedot").get("huoltaja") != null
                                ? tietoryhma.get("voimassaolevatTiedot").get("huoltaja")
                                : tietoryhma.get("huoltaja");
                Set<HuoltajaCreateDto> huoltajat = update.getHuoltajat();
                if ("POISTETTU".equals(getStringValue(tietoryhma, "muutosattribuutti"))) {
                    huoltajat.removeIf(huoltaja -> huoltajaMatches(huoltaja, huoltajaJson));
                } else if (isDataUpdate(tietoryhma)) {
                    HuoltajaCreateDto huoltajaCreateDto = huoltajat.stream()
                            .filter(huoltaja -> huoltajaMatches(huoltaja, huoltajaJson))
                            .findFirst()
                            .orElseGet(HuoltajaCreateDto::new);
                    huoltajat.removeIf(huoltaja -> huoltajaMatches(huoltaja, huoltajaJson));
                    LocalDate alkupv = parseDate(tietoryhma.get("huoltosuhteenAlkupv"));
                    LocalDate loppupv = parseDate(tietoryhma.get("huoltosuhteenLoppupv"));
                    if ((alkupv == null || LocalDate.now().isAfter(alkupv))
                            && (loppupv == null || LocalDate.now().isBefore(loppupv))) {
                        huoltajaCreateDto.setHetu(getStringValue(huoltajaJson, "henkilotunnus"));
                        huoltajaCreateDto.setHuoltajuusAlku(alkupv);
                        huoltajaCreateDto.setHuoltajuusLoppu(loppupv);
                        huoltajaCreateDto.setEtunimet(getStringValue(huoltajaJson, "etunimet"));
                        huoltajaCreateDto.setKutsumanimi(getStringValue(huoltajaJson, "etunimet"));
                        huoltajaCreateDto.setSukunimi(getStringValue(huoltajaJson, "sukunimi"));
                        huoltajaCreateDto.setSyntymaaika(parseDate(huoltajaJson.get("syntymapv")));
                        if (getStringValue(huoltajaJson, "kansalaisuuskoodi") != null) {
                            huoltajaCreateDto.setKansalaisuusKoodi(
                                    Set.of(getStringValue(huoltajaJson, "kansalaisuuskoodi")));
                        }
                        huoltajat.add(huoltajaCreateDto);
                    }
                }
                break;
            default:
                log.debug("did not know how to handle tietoryhma " + getStringValue(tietoryhma, "tietoryhma"));
                break;
        }
        return update;
    }
}
