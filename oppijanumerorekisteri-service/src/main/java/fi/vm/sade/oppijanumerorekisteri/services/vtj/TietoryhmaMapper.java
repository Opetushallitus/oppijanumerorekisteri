package fi.vm.sade.oppijanumerorekisteri.services.vtj;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KoodiNimiReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.utils.KoodistoUtils;
import fi.vm.sade.oppijanumerorekisteri.utils.VtjYhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.validators.VtjMuutostietoValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static java.util.stream.Collectors.joining;

@Slf4j
@RequiredArgsConstructor
public abstract class TietoryhmaMapper {
    private final KoodistoService koodistoService;

    protected void setKuolinpaiva(HenkiloForceUpdateDto update, JsonNode tietoryhma) {
        if (tietoryhma.get("kuollut").asBoolean()) {
            if (tietoryhma.get("kuolinpv") != null) {
                update.setKuolinpaiva(parseDate(tietoryhma.get("kuolinpv")));
            } else {
                update.setKuolinpaiva(LocalDate.now());
            }
        } else if (!tietoryhma.get("kuollut").asBoolean()) {
            update.setKuolinpaiva(null);
        }
    }

    protected static LocalDate parseDate(JsonNode date) {
        if (date == null) {
            return null;
        }

        switch (getStringValue(date, "tarkkuus")) {
            case "PAIVA":
                return LocalDate.parse(getStringValue(date, "arvo"));
            case "KUUKAUSI":
                return LocalDate.parse(getStringValue(date, "arvo") + "-01");
            case "VUOSI":
                return LocalDate.parse(getStringValue(date, "arvo") + "-01-01");
            case "EI_TIEDOSSA":
                return null;
            default:
                log.debug("failed to parse a date with tarkkuus " + getStringValue(date, "tarkkuus"));
                return null;
        }
    }

    protected String getSukupuoli(JsonNode tietoryhma) {
        String sukupuoli = getStringValue(tietoryhma, "sukupuoli");
        switch (sukupuoli) {
            case "MIES":
                return "1";
            case "NAINEN":
                return "2";
            case "PUUTTUU":
                return " ";
            default:
                log.debug("failed to parse sukupuoli with value " + sukupuoli);
                return null;
        }
    }

    protected Set<KansalaisuusDto> getKansalaisuus(JsonNode tietoryhma) {
        JsonNode henkilonKansalaisuudet = tietoryhma.get("henkilonKansalaisuudet");
        Set<KansalaisuusDto> kansalaisuudet = new HashSet<>();
        for (JsonNode kansalaisuus : henkilonKansalaisuudet) {
            KansalaisuusDto dto = new KansalaisuusDto(getStringValue(kansalaisuus, "kansalaisuuskoodi"));
            kansalaisuudet.add(dto);
        }
        return kansalaisuudet;
    }

    protected boolean isTurvakiellonAlainen(JsonNode tietoryhma) {
        return tietoryhma.get("turvakiellonAlaisetKentat") != null
                && tietoryhma.get("turvakiellonAlaisetKentat").isArray();
    }

    private YhteystiedotRyhmaDto createYhteystiedotRyhmaDto(VtjYhteystiedotRyhma ryhmaKuvaus) {
        YhteystiedotRyhmaDto yhteystiedotRyhmaDto = new YhteystiedotRyhmaDto();
        yhteystiedotRyhmaDto.setReadOnly(true);
        yhteystiedotRyhmaDto.setRyhmaAlkuperaTieto("alkupera1");
        yhteystiedotRyhmaDto.setRyhmaKuvaus(ryhmaKuvaus.getKuvaus());
        yhteystiedotRyhmaDto.setYhteystieto(new HashSet<>());
        return yhteystiedotRyhmaDto;
    }

    private Optional<YhteystietoDto> findYhteystieto(YhteystiedotRyhmaDto yhteystietoryhma, YhteystietoTyyppi tyyppi) {
        return yhteystietoryhma.getYhteystieto().stream()
                .filter(yhteystieto -> tyyppi.equals(yhteystieto.getYhteystietoTyyppi()))
                .findFirst();
    }

    protected void setYhteystietoArvo(YhteystiedotRyhmaDto yhteystietoryhma, YhteystietoTyyppi tyyppi, String arvo) {
        findYhteystieto(yhteystietoryhma, tyyppi).orElseGet(() -> {
            YhteystietoDto yhteystieto = new YhteystietoDto();
            yhteystieto.setYhteystietoTyyppi(tyyppi);
            yhteystietoryhma.getYhteystieto().add(yhteystieto);
            return yhteystieto;
        }).setYhteystietoArvo(arvo != null ? arvo : "");
    }

    protected boolean removeYhteystietoryhma(Set<YhteystiedotRyhmaDto> yhteystietoryhmat, VtjYhteystiedotRyhma ryhma) {
        return yhteystietoryhmat.removeIf(
                t -> "alkupera1".equals(t.getRyhmaAlkuperaTieto()) && ryhma.getKuvaus().equals(t.getRyhmaKuvaus()));
    }

    protected boolean removeAllYhteystietoryhmas(Set<YhteystiedotRyhmaDto> yhteystietoryhmat) {
        return yhteystietoryhmat.removeIf(t -> "alkupera1".equals(t.getRyhmaAlkuperaTieto()));
    }

    protected YhteystiedotRyhmaDto removeAndCreateNewYhteystiedotRyhmaDto(HenkiloForceUpdateDto update,
            VtjYhteystiedotRyhma ryhmaKuvaus) {
        Set<YhteystiedotRyhmaDto> ryhmas = update.getYhteystiedotRyhma();
        removeYhteystietoryhma(ryhmas, ryhmaKuvaus);
        YhteystiedotRyhmaDto newRyhma = createYhteystiedotRyhmaDto(ryhmaKuvaus);
        ryhmas.add(newRyhma);
        return newRyhma;
    }

    protected String getLocalizedValue(JsonNode tietoryhma, String fieldName, String locale) {
        if (tietoryhma.get(fieldName) == null) {
            return null;
        }

        JsonNode localized = tietoryhma.get(fieldName).get(locale);
        if (localized != null) {
            return localized.asText();
        } else {
            return tietoryhma.get(fieldName).get("fi").asText();
        }
    }

    public static String getStringValue(JsonNode node, String fieldName) {
        return node == null || node.get(fieldName) == null ? null : node.get(fieldName).asText();
    }

    protected void setKotimainenPostiosoite(HenkiloForceUpdateDto update, JsonNode tietoryhma, String locale) {
        YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                VtjYhteystiedotRyhma.KOTIMAINEN_POSTIOSOITE);
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
                getLocalizedValue(tietoryhma, "postiosoite", locale));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO,
                getStringValue(tietoryhma, "postinumero"));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI,
                getLocalizedValue(tietoryhma, "postitoimipaikka", locale));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_MAA, getMaa("246", locale));

    }

    protected void setKotimainenOsoite(YhteystiedotRyhmaDto yhteystiedotRyhma, JsonNode tietoryhma, String locale) {
        String huoneistonumero = StringUtils
                .trimLeadingCharacter(getStringValue(tietoryhma, "huoneistonumero"), '0');
        String katuosoite = Stream
                .of(getLocalizedValue(tietoryhma, "katunimi", locale),
                        getStringValue(tietoryhma, "katunumero"),
                        getStringValue(tietoryhma, "huoneistokirjain"),
                        huoneistonumero,
                        getStringValue(tietoryhma, "jakokirjain"))
                .map(StringUtils::trimWhitespace)
                .filter(StringUtils::hasLength)
                .collect(joining(" "));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, katuosoite);
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO,
                getStringValue(tietoryhma, "postinumero"));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI,
                getLocalizedValue(tietoryhma, "postitoimipaikka", locale));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_MAA, getMaa("246", locale));
    }

    private String getMaa(String valtiokoodi, String locale) {
        Iterable<KoodiType> maat = koodistoService.list(Koodisto.MAAT_JA_VALTIOT_2);
        KoodiNimiReadDto maa = KoodistoUtils.getKoodiNimiReadDto(maat, valtiokoodi);
        return "sv".equals(locale) ? maa.getNimi().getSv() : maa.getNimi().getFi();
    }

    protected void setUlkomainenOsoite(YhteystiedotRyhmaDto yhteystiedotRyhma, JsonNode tietoryhma, String locale) {
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
                getStringValue(tietoryhma, "lahiosoite"));
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KUNTA,
                getStringValue(tietoryhma, "paikkakunta"));
        String valtiokoodi = getStringValue(tietoryhma, "valtiokoodi");
        String maa = VtjMuutostietoValidator.KANSALAISUUSKOODI_TUNTEMATON.equals(valtiokoodi)
                ? getStringValue(tietoryhma, "valtionimi")
                : getMaa(valtiokoodi, locale);
        setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_MAA, maa);
    }

    protected KielisyysDto getKielisyys(JsonNode tietoryhma) {
        return new KielisyysDto(getStringValue(tietoryhma, "kielikoodi"), getStringValue(tietoryhma, "nimi"));
    }

    protected boolean huoltajaMatches(HuoltajaCreateDto huoltajaCreateDto, JsonNode huoltaja) {
        String henkilotunnus = getStringValue(huoltaja, "henkilotunnus");
        if (StringUtils.hasLength(henkilotunnus) && henkilotunnus.equals(huoltajaCreateDto.getHetu())) {
            return true;
        }
        return StringUtils.hasLength(huoltajaCreateDto.getEtunimet())
                && huoltajaCreateDto.getEtunimet().equals(getStringValue(huoltaja, "etunimet"))
                && StringUtils.hasLength(huoltajaCreateDto.getSukunimi())
                && huoltajaCreateDto.getSukunimi().equals(getStringValue(huoltaja, "sukunimi"));
    }

    protected void addOrUpdateHuoltaja(Set<HuoltajaCreateDto> huoltajat, JsonNode tietoryhma) {
        JsonNode huoltajaJson = tietoryhma.get("huoltaja");
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

    public abstract HenkiloForceUpdateDto mutateUpdateDto(HenkiloForceUpdateDto update, JsonNode tietoryhma,
            String locale, boolean isTurvakielto);
}
