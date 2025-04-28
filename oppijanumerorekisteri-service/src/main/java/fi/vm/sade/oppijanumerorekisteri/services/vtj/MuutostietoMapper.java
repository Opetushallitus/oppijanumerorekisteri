package fi.vm.sade.oppijanumerorekisteri.services.vtj;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;

import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.utils.VtjYhteystiedotRyhma;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class MuutostietoMapper extends TietoryhmaMapper {
    public MuutostietoMapper(KoodistoService koodistoService) {
        super(koodistoService);
    }

    public static boolean isDataUpdate(JsonNode tietoryhma) {
        String muutosattribuutti = getStringValue(tietoryhma, "muutosattribuutti");
        if (List.of("LISATTY", "KORJATTU", "MUUTETTU").contains(muutosattribuutti)) {
            LocalDate loppupv = parseDate(tietoryhma.get("loppupv"));
            return loppupv == null || loppupv.isAfter(LocalDate.now());
        }

        return false;
    }

    public static boolean isLisatty(JsonNode tietoryhma) {
        return muutosattribuuttiEquals(tietoryhma, "LISATTY");
    }

    public static boolean isPoistettu(JsonNode tietoryhma) {
        return muutosattribuuttiEquals(tietoryhma, "POISTETTU");
    }

    public static boolean isKorjattava(JsonNode tietoryhma) {
        return muutosattribuuttiEquals(tietoryhma, "KORJATTAVA");
    }

    public static boolean isKorjattu(JsonNode tietoryhma) {
        return muutosattribuuttiEquals(tietoryhma, "KORJATTU");
    }

    public static boolean isMuutettu(JsonNode tietoryhma) {
        return muutosattribuuttiEquals(tietoryhma, "MUUTETTU");
    }

    private static boolean muutosattribuuttiEquals(JsonNode tietoryhma, String muutosattribuutti) {
        return muutosattribuutti.equals(getStringValue(tietoryhma, "muutosattribuutti"));
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
                break;
            case "KOTIKUNTA":
                if (isLisatty(tietoryhma)) {
                    update.setKotikunta(getStringValue(tietoryhma, KOTIKUNTA_KUNTAKOODI));
                } else if (isPoistettu(tietoryhma)) {
                    var voimassaolevatTiedot = tietoryhma.get("voimassaolevatTiedot").get(0);
                    update.setKotikunta(getStringValue(voimassaolevatTiedot, KOTIKUNTA_KUNTAKOODI));
                }
                break;
            case "EDELLINEN_KOTIKUNTA":
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
                Set<HuoltajaCreateDto> huoltajat = update.getHuoltajat();
                if (isPoistettu(tietoryhma)) {
                    JsonNode huoltajaJson = tietoryhma.get("huoltaja");
                    huoltajat.removeIf(huoltaja -> huoltajaMatches(huoltaja, huoltajaJson));
                } else if (isDataUpdate(tietoryhma)) {
                    if (tietoryhma.get("voimassaolevatTiedot") != null
                            && tietoryhma.get("voimassaolevatTiedot").isArray()) {
                        for (JsonNode huoltajaTietoryhma : tietoryhma.get("voimassaolevatTiedot")) {
                            addOrUpdateHuoltaja(huoltajat, huoltajaTietoryhma);
                        }
                    } else {
                        addOrUpdateHuoltaja(huoltajat, tietoryhma);
                    }
                }
                break;
            default:
                log.debug("did not know how to handle tietoryhma " + getStringValue(tietoryhma, "tietoryhma"));
                break;
        }
        return update;
    }

    public KotikuntahistoriaChanges mapToKotikuntahistoriaChanges(
            Henkilo henkilo,
            JsonNode tietoryhmat,
            List<KotikuntaHistoria> kotikuntahistoria
    ) {
        var changes = new KotikuntahistoriaChanges();
        for (var i = 0; i < tietoryhmat.size(); i++) {
            var tietoryhma = tietoryhmat.get(i);
            switch (getStringValue(tietoryhma, "tietoryhma")) {
                case "KOTIKUNTA":
                    if (isLisatty(tietoryhma)) {
                        changes.updates().add(new fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria(
                                henkilo.getId(),
                                getStringValue(tietoryhma, KOTIKUNTA_KUNTAKOODI),
                                getDateValue(tietoryhma, KOTIKUNTA_KUNTAANMUUTTOPV),
                                getDateValue(tietoryhma, KOTIKUNTA_KUNNASTAPOISMUUTTOPV)
                        ));
                    } else if (isPoistettu(tietoryhma)) {
                        kotikuntahistoria.stream()
                                .filter(matchesTietoryhma(tietoryhma))
                                .findFirst()
                                .ifPresent(changes.deletes()::add);
                    }
                    break;
                case "EDELLINEN_KOTIKUNTA":
                    if (isLisatty(tietoryhma)) {
                        log.info(
                                "{} tietoryhmä ei pitäisi tulla muutosattribuutille {}",
                                getStringValue(tietoryhma, "tietoryhma"),
                                getStringValue(tietoryhma, "muutosattribuutti")
                        );
                        changes.updates().add(KotikuntaHistoria.builder()
                                .henkiloId(henkilo.getId())
                                .kotikunta(getStringValue(tietoryhma, KOTIKUNTA_KUNTAKOODI))
                                .kuntaanMuuttopv(getDateValue(tietoryhma, KOTIKUNTA_KUNTAANMUUTTOPV))
                                .kunnastaPoisMuuttopv(getDateValue(tietoryhma, KOTIKUNTA_KUNNASTAPOISMUUTTOPV))
                                .build());
                    } else if (isPoistettu(tietoryhma)) {
                        kotikuntahistoria.stream()
                                .filter(matchesTietoryhma(tietoryhma))
                                .findFirst()
                                .ifPresent(changes.deletes()::add);
                    } else if (isKorjattava(tietoryhma)) {
                        var korjattuTietoryhma = tietoryhmat.get(i + 1);
                        kotikuntahistoria.stream()
                                .filter(matchesTietoryhma(tietoryhma))
                                .findFirst()
                                .ifPresent(kh -> {
                                    kh.setKotikunta(getStringValue(korjattuTietoryhma, KOTIKUNTA_KUNTAKOODI));
                                    kh.setKuntaanMuuttopv(getDateValue(korjattuTietoryhma, KOTIKUNTA_KUNTAANMUUTTOPV));
                                    kh.setKunnastaPoisMuuttopv(getDateValue(korjattuTietoryhma, KOTIKUNTA_KUNNASTAPOISMUUTTOPV));
                                    changes.updates().add(kh);
                                });
                    } else if (isMuutettu(tietoryhma)) {
                        // Tää on erikoinen keissi, sillä tietoryhmä ei suoranaisesti kerro, mikä on muuttunut ja miten.
                        // Oletetaan, että kyseessä että kuntakoodi ja kuntaanMuuttopv on pysyvät ja kunnastaMuuttopv on muuttunut kuten kotikunnan vaihtuessa käy.
                        kotikuntahistoria.stream().filter(kh -> {
                            var kuntakoodiMatches = Objects.equals(kh.getKotikunta(), getStringValue(tietoryhma, "kuntakoodi"));
                            var alkuMatches = Objects.equals(kh.getKuntaanMuuttopv(), getDateValue(tietoryhma, KOTIKUNTA_KUNTAANMUUTTOPV));
                            return kuntakoodiMatches && alkuMatches;
                        }).findFirst().ifPresent(kh -> {
                            kh.setKunnastaPoisMuuttopv(getDateValue(tietoryhma, KOTIKUNTA_KUNNASTAPOISMUUTTOPV));
                            changes.updates().add(kh);
                        });
                    }
                    break;
            }
        }
        return changes;
    }

    private Predicate<KotikuntaHistoria> matchesTietoryhma(JsonNode tietoryhma) {
        return kh -> {
            var kuntakoodiMatches = Objects.equals(kh.getKotikunta(), getStringValue(tietoryhma, KOTIKUNTA_KUNTAKOODI));
            var muuttopvMatches = Objects.equals(kh.getKuntaanMuuttopv(), getDateValue(tietoryhma, KOTIKUNTA_KUNTAANMUUTTOPV));
            var poisMuuttopvMatches=  Objects.equals(kh.getKunnastaPoisMuuttopv(), getDateValue(tietoryhma, KOTIKUNTA_KUNNASTAPOISMUUTTOPV));
            return kuntakoodiMatches && muuttopvMatches && poisMuuttopvMatches;
        };
    }
}
