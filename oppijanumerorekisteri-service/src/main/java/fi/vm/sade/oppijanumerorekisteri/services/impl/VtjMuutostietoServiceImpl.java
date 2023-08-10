package fi.vm.sade.oppijanumerorekisteri.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletionException;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KoodiNimiReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoKirjausavainRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.VtjMuutostietoService;
import fi.vm.sade.oppijanumerorekisteri.utils.KoodistoUtils;
import fi.vm.sade.oppijanumerorekisteri.utils.VtjYhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.validators.VtjMuutostietoValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static java.util.stream.Collectors.joining;

@Slf4j
@Service
@RequiredArgsConstructor
public class VtjMuutostietoServiceImpl implements VtjMuutostietoService {
    private final VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    private final VtjMuutostietoRepository muutostietoRepository;
    private final VtjMuutostietoClient muutostietoClient;
    private final HenkiloRepository henkiloRepository;
    private final HenkiloModificationService henkiloModificationService;
    private final OrikaConfiguration mapper;
    private final KoodistoService koodistoService;
    private final SlackClient slackClient;

    @Autowired
    private TransactionTemplate transaction;

    private VtjMuutostietoKirjausavain fetchNewKirjausavain(long id) {
        try {
            long avain = muutostietoClient.fetchMuutostietoKirjausavain();
            VtjMuutostietoKirjausavain kirjausavain = new VtjMuutostietoKirjausavain(id, avain, LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return kirjausavain;
        } catch (InterruptedException ie) {
            log.error("interrupted fetching a new kirjausavain", ie);
            Thread.currentThread().interrupt();
            throw new CompletionException(ie);
        } catch (Exception e) {
            throw new CompletionException(e);
        }
    }

    public boolean fetchMuutostietoBatchForBucket(long bucketId, List<String> hetus) {
        try {
            VtjMuutostietoKirjausavain kirjausavain = kirjausavainRepository.findById(bucketId)
                    .orElseGet(() -> fetchNewKirjausavain(bucketId));
            log.info("using kirjausavain " + kirjausavain.getAvain() + " for bucket " + bucketId);
            VtjMuutostietoResponse response = muutostietoClient.fetchHenkiloMuutostieto(kirjausavain.getAvain(),
                    hetus);
            muutostietoRepository.saveAll(response.getMuutokset());
            kirjausavain.setAvain(response.getViimeisinKirjausavain());
            kirjausavain.setUpdatedAt(LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return response.getAjanTasalla();
        } catch (InterruptedException ie) {
            log.error("interrupted while fetching muutostieto for bucket " + bucketId, ie);
            Thread.currentThread().interrupt();
            return true;
        } catch (Exception e) {
            log.error("exception while fetching muutostieto for bucket " + bucketId, e);
            return true;
        }
    }

    private void fetchHenkiloMuutostieto() {
        for (int i = 0; i < 100; i++) {
            final int bucketId = i;
            log.info("fetching muutostieto for bucket " + bucketId);
            long start = System.currentTimeMillis();

            boolean ajanTasalla;
            List<String> hetus = henkiloRepository.findHetusInVtjBucket(bucketId);
            log.info("bucket " + bucketId + " size is " + hetus.size());
            do {
                ajanTasalla = transaction.execute(status -> fetchMuutostietoBatchForBucket(bucketId, hetus));
            } while (!ajanTasalla);

            long duration = System.currentTimeMillis() - start;
            log.info("fetching muutostieto for bucket took " + duration + "ms");
        }
    }

    private LocalDate parseDate(JsonNode date) {
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

    private String parseSukupuoli(String sukupuoli) {
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

    private Set<KansalaisuusDto> parseKansalaisuudet(JsonNode henkilonKansalaisuudet) {
        Set<KansalaisuusDto> kansalaisuudet = new HashSet<>();
        for (JsonNode kansalaisuus : henkilonKansalaisuudet) {
            KansalaisuusDto dto = new KansalaisuusDto(getStringValue(kansalaisuus, "kansalaisuuskoodi"));
            kansalaisuudet.add(dto);
        }
        return kansalaisuudet;
    }

    private boolean isTurvakiellonAlainen(JsonNode tietoryhma, String tietoryhmaTyyppi) {
        if (tietoryhma.get("turvakiellonAlaisetKentat") != null
                && tietoryhma.get("turvakiellonAlaisetKentat").isArray()) {
            for (JsonNode kentta : tietoryhma.get("turvakiellonAlaisetKentat")) {
                if (tietoryhmaTyyppi.equals(kentta.asText())) {
                    return true;
                }
            }
        }
        return false;
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

    private void setYhteystietoArvo(YhteystiedotRyhmaDto yhteystietoryhma, YhteystietoTyyppi tyyppi, String arvo) {
        findYhteystieto(yhteystietoryhma, tyyppi).orElseGet(() -> {
            YhteystietoDto yhteystieto = new YhteystietoDto();
            yhteystieto.setYhteystietoTyyppi(tyyppi);
            yhteystietoryhma.getYhteystieto().add(yhteystieto);
            return yhteystieto;
        }).setYhteystietoArvo(arvo != null ? arvo : "");
    }

    private boolean removeYhteystietoryhma(Set<YhteystiedotRyhmaDto> yhteystietoryhmat, VtjYhteystiedotRyhma ryhma) {
        return yhteystietoryhmat.removeIf(
                t -> "alkupera1".equals(t.getRyhmaAlkuperaTieto()) && ryhma.getKuvaus().equals(t.getRyhmaKuvaus()));
    }

    private YhteystiedotRyhmaDto removeAndCreateNewYhteystiedotRyhmaDto(HenkiloForceUpdateDto update,
            VtjYhteystiedotRyhma ryhmaKuvaus) {
        Set<YhteystiedotRyhmaDto> ryhmas = update.getYhteystiedotRyhma();
        removeYhteystietoryhma(ryhmas, ryhmaKuvaus);
        YhteystiedotRyhmaDto newRyhma = createYhteystiedotRyhmaDto(ryhmaKuvaus);
        ryhmas.add(newRyhma);
        return newRyhma;
    }

    private String getLocalizedValue(JsonNode tietoryhma, String fieldName, String locale) {
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

    private String getStringValue(JsonNode node, String fieldName) {
        return node == null || node.get(fieldName) == null ? null : node.get(fieldName).asText();
    }

    private void setKotimainenOsoite(YhteystiedotRyhmaDto yhteystiedotRyhma, JsonNode tietoryhma, String locale) {
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
    }

    private String getMaa(String valtiokoodi, String locale) {
        Iterable<KoodiType> maat = koodistoService.list(Koodisto.MAAT_JA_VALTIOT_2);
        KoodiNimiReadDto maa = KoodistoUtils.getKoodiNimiReadDto(maat, valtiokoodi);
        return "sv".equals(locale) ? maa.getNimi().getSv() : maa.getNimi().getFi();
    }

    private void setUlkomainenOsoite(YhteystiedotRyhmaDto yhteystiedotRyhma, JsonNode tietoryhma, String locale) {
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

    private HenkiloForceUpdateDto mutateUpdateDto(HenkiloForceUpdateDto update, JsonNode tietoryhma, String locale) {
        switch (getStringValue(tietoryhma, "tietoryhma")) {
            case "HENKILON_NIMI":
                update.setEtunimet(getStringValue(tietoryhma, "etunimi"));
                update.setSukunimi(getStringValue(tietoryhma, "sukunimi"));
                break;
            case "KUOLINPAIVA":
                if (tietoryhma.get("kuollut").asBoolean() && tietoryhma.get("kuolinpv") != null) {
                    update.setKuolinpaiva(parseDate(tietoryhma.get("kuolinpv")));
                }
                break;
            case "SYNTYMAPAIVA":
                update.setSyntymaaika(parseDate(tietoryhma.get("syntymapv")));
                break;
            case "SUKUPUOLI":
                update.setSukupuoli(parseSukupuoli(getStringValue(tietoryhma, "sukupuoli")));
                break;
            case "KANSALAISUUS":
                update.setKansalaisuus(parseKansalaisuudet(tietoryhma.get("henkilonKansalaisuudet")));
                break;
            case "AIDINKIELI":
                update.setAidinkieli(
                        new KielisyysDto(getStringValue(tietoryhma, "kielikoodi"), getStringValue(tietoryhma, "nimi")));
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
                if (!isTurvakiellonAlainen(tietoryhma, "KOTIKUNTA")) {
                    update.setKotikunta(getStringValue(tietoryhma, "kuntakoodi"));
                }
                break;
            case "SAHKOPOSTIOSOITE":
                if (!isTurvakiellonAlainen(tietoryhma, "SAHKOPOSTIOSOITE")
                        && tietoryhma.get("sahkopostiosoite") != null) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.SAHKOPOSTIOSOITE);
                    setYhteystietoArvo(yhteystiedotRyhma,
                            YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, getStringValue(tietoryhma, "sahkopostiosoite"));
                }
                break;
            case "KOTIMAINEN_POSTIOSOITE":
                if (!isTurvakiellonAlainen(tietoryhma, "KOTIMAINEN_POSTIOSOITE")) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.KOTIMAINEN_POSTIOSOITE);
                    setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
                            getLocalizedValue(tietoryhma, "postiosoite", locale));
                    setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO,
                            getStringValue(tietoryhma, "postinumero"));
                    setYhteystietoArvo(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI,
                            getLocalizedValue(tietoryhma, "postitoimipaikka", locale));
                }
                break;
            case "VAKINAINEN_KOTIMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma, "VAKINAINEN_KOTIMAINEN_OSOITE")) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.VAKINAINEN_KOTIMAINEN_OSOITE);
                    setKotimainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "VAKINAINEN_ULKOMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma, "VAKINAINEN_ULKOMAINEN_OSOITE")) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.VAKINAINEN_ULKOMAINEN_OSOITE);
                    setUlkomainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "TILAPAINEN_KOTIMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma, "TILAPAINEN_KOTIMAINEN_OSOITE")) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.TILAPAINEN_KOTIMAINEN_OSOITE);
                    setKotimainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            case "TILAPAINEN_ULKOMAINEN_OSOITE":
                if (!isTurvakiellonAlainen(tietoryhma, "TILAPAINEN_ULKOMAINEN_OSOITE")) {
                    YhteystiedotRyhmaDto yhteystiedotRyhma = removeAndCreateNewYhteystiedotRyhmaDto(update,
                            VtjYhteystiedotRyhma.TILAPAINEN_ULKOMAINEN_OSOITE);
                    setUlkomainenOsoite(yhteystiedotRyhma, tietoryhma, locale);
                }
                break;
            default:
                log.debug("did not know how to handle tietoryhma " + getStringValue(tietoryhma, "tietoryhma"));
                break;
        }
        return update;
    }

    private String findYhteystietoLocale(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("AIDINKIELI".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return "swe".equals(getStringValue(tietoryhma, "kielikoodiISO6392")) ? "sv" : "fi";
            }
        }
        return "fi";
    }

    private HenkiloForceUpdateDto mapToUpdateDto(HenkiloForceReadDto read, JsonNode tietoryhmat) {
        HenkiloForceUpdateDto update = new HenkiloForceUpdateDto();
        update.setOidHenkilo(read.getOidHenkilo());
        update.setTurvakielto(false);
        update.setYhteystiedotRyhma(read.getYhteystiedotRyhma());
        update.setHuoltajat(read.getHuoltajat());
        String locale = findYhteystietoLocale(tietoryhmat);
        for (JsonNode tietoryhma : tietoryhmat) {
            mutateUpdateDto(update, tietoryhma, locale);
        }
        VtjMuutostietoValidator validator = new VtjMuutostietoValidator(koodistoService);
        validator.validateAndCorrectErrors(update);
        return update;
    }

    private boolean isHenkilotunnusKorjaus(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("HENKILOTUNNUS_KORJAUS".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return true;
            }
        }
        return false;
    }

    public Void savePerustieto(VtjPerustieto perustieto) {
        henkiloRepository.findByHetu(perustieto.henkilotunnus).ifPresent(henkilo -> {
            if (isHenkilotunnusKorjaus(perustieto.tietoryhmat)) {
                String message = String.format(
                        "VTJ-perustietojen tallennus käyttäjälle %s estetty HENKILOTUNNUS_KORJAUS-tietoryhmän vuoksi",
                        henkilo.getOidHenkilo());
                slackClient.sendToSlack(message, null);
                return;
            }

            HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
            HenkiloForceUpdateDto update = mapToUpdateDto(read, perustieto.tietoryhmat);
            henkiloModificationService.forceUpdateHenkilo(update);
            henkilo.setVtjBucket(henkilo.getId() % 100);
            henkiloRepository.save(henkilo);
        });
        return null;
    }

    private void savePerustietoForNewHetus() {
        List<String> hetusWithoutBucket = henkiloRepository.findHetusWithoutVtjBucket();
        log.info("found " + hetusWithoutBucket.size() + " hetus without vtj bucket");

        try {
            List<VtjPerustieto> perustiedot = muutostietoClient.fetchHenkiloPerustieto(hetusWithoutBucket);
            perustiedot.stream().forEach(
                    perustieto -> transaction.execute(status -> savePerustieto(perustieto)));
        } catch (InterruptedException ie) {
            log.error("interrupted while fetching perustieto", ie);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("exception while fetching perustieto", e);
            slackClient.sendToSlack("Virhe VTJ-perustietojen tallennuksessa", e.toString());
        }
    }

    @Override
    public void handleMuutostietoFetchTask() {
        log.info("starting muutostieto fetch task");

        // savePerustietoForNewHetus();
        fetchHenkiloMuutostieto();

        log.info("finishing muutostieto fetch task");
    }
}
