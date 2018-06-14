package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.AsiayhteysHakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.AsiayhteysKayttooikeusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.NimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointitietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiVertailuDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YksilointitietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import lombok.RequiredArgsConstructor;
import org.apache.lucene.search.spell.JaroWinklerDistance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toCollection;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

import java.util.stream.Stream;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class YksilointiServiceImpl implements YksilointiService {
    private static final Logger logger = LoggerFactory.getLogger(YksilointiService.class);
    private static final String KIELIKOODI_SV = "sv";

    public static final String RYHMAALKUPERA_VTJ = "alkupera1";
    private static final String RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE = "yhteystietotyyppi8";

    private static final Predicate<String> stringNotEmpty = it -> !StringUtils.isEmpty(it);
    private static final Predicate<Collection> collectionNotEmpty = it -> !CollectionUtils.isEmpty(it);

    private final DuplicateService duplicateService;

    private final HenkiloRepository henkiloRepository;
    private final HenkiloService henkiloService;
    private final HenkiloModificationService henkiloModificationService;
    private final KansalaisuusRepository kansalaisuusRepository;
    private final KielisyysRepository kielisyysRepository;
    private final YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository;
    private final YhteystietoRepository yhteystietoRepository;
    private final YksilointitietoRepository yksilointitietoRepository;
    private final YksilointivirheRepository yksilointivirheRepository;
    private final AsiayhteysPalveluRepository asiayhteysPalveluRepository;
    private final AsiayhteysHakemusRepository asiayhteysHakemusRepository;
    private final AsiayhteysKayttooikeusRepository asiayhteysKayttooikeusRepository;
    private final OrikaConfiguration mapper;

    private final VtjClient vtjClient;
    private final KoodistoClient koodistoClient;
    private final KayttooikeusClient kayttooikeusClient;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    private Henkilo getHenkiloByOid(String oid) {
        return henkiloRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("Henkilo not found by oid " + oid));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void yksiloiAutomaattisesti(final String henkiloOid) {
        henkiloRepository.findByOidHenkilo(henkiloOid).ifPresent(this::yksiloiHenkilo);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void tallennaYksilointivirhe(String henkiloOid, Exception exception) {
        henkiloRepository.findByOidHenkilo(henkiloOid).ifPresent(henkilo -> tallennaYksilointivirhe(henkilo, exception));

    }

    private void tallennaYksilointivirhe(Henkilo henkilo, Exception exception) {
        henkilo.setYksilointiYritetty(true);

        Yksilointivirhe yksilointivirhe = yksilointivirheRepository.findByHenkilo(henkilo)
                .orElseGet(() -> new Yksilointivirhe(henkilo));
        yksilointivirhe.setAikaleima(new Date());
        yksilointivirhe.setPoikkeus(exception.getClass().getCanonicalName());
        yksilointivirhe.setViesti(exception.getMessage());
        yksilointivirheRepository.save(yksilointivirhe);
    }

    @Override
    @Transactional
    public Henkilo yksiloiManuaalisesti(final String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        return yksiloiHenkilo(henkilo);
    }

    @Override
    @Transactional
    public Henkilo hetuttomanYksilointi(String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        if (!StringUtils.isEmpty(henkilo.getHetu())) {
            throw new ValidationException("Henkilöllä on hetu, yksilöintiä ei voida tehdä");
        }

        henkilo.setYksiloity(true);
        henkilo.setDuplicate(false);
        henkilo.setOppijanumero(henkilo.getOidHenkilo());
        return henkiloModificationService.update(henkilo);
    }

    private @NotNull Henkilo yksiloiHenkilo(@NotNull final Henkilo henkilo) {
        if (StringUtils.isEmpty(henkilo.getHetu())) {
            throw new ValidationException(String.format("Henkilöä '%s' ei voida yksilöidä koska hetu puuttuu", henkilo.getOidHenkilo()));
        }

        /* VTJ data for Henkilo contains a huge data set and parsing this data
         * might change in the future, if Henkilo's data must contain all what
         * VTJ has to offer but that's still uncertain
         */
        YksiloityHenkilo yksiloityHenkilo = vtjClient.fetchHenkilo(henkilo.getHetu())
                .orElseThrow(() ->
                        new DataInconsistencyException("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: " + henkilo.getHetu()));

        henkilo.setYksilointiYritetty(true);

        Set<String> kaikkiSukunimet = Stream.concat(Stream.of(yksiloityHenkilo.getSukunimi()),
                Optional.ofNullable(yksiloityHenkilo.getEntisetNimet()).orElseGet(Collections::emptyList)
                        .stream()
                        .filter(YksiloityHenkilo.EntinenNimi::isSukunimi)
                        .map(YksiloityHenkilo.EntinenNimi::getArvo))
                .filter(Objects::nonNull)
                .collect(toCollection(LinkedHashSet::new));
        NimienYhtenevyys nimienYhtenevyys = tarkistaNimet(henkilo, yksiloityHenkilo, kaikkiSukunimet);

        if (!nimienYhtenevyys.etunimimatch || !nimienYhtenevyys.sukunimimatch) {
            logger.info("Henkilön tiedot eivät täsmää VTJ-tietoon\n--OID: " + henkilo.getOidHenkilo() + "\n"
                    + "--Annetut etunimet: " + henkilo.getEtunimet() + ", VTJ: " + yksiloityHenkilo.getEtunimi() + "\n"
                    + "--Annettu kutsumanimi: " + henkilo.getKutsumanimi() + ", VTJ: " + yksiloityHenkilo.getKutsumanimi() + "\n"
                    + "--Annettu sukunimi: " + henkilo.getSukunimi() + ", VTJ (ml. entiset): " + kaikkiSukunimet.stream().collect(joining(", ")));

            addYksilointitietosWhenNamesDoNotMatch(henkilo, yksiloityHenkilo);
        }
        else {
            logger.info("Henkilön yksilöinti onnistui hetulle: {}", henkilo.getHetu());

            henkilo.setOppijanumero(henkilo.getOidHenkilo());
            // If VTJ data differs from the user's data, VTJ must overwrite
            // those values since VTJ's data is considered more reliable
            this.paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);

            henkilo.setYksiloityVTJ(true);
            //OPHASPA-1820 kumotaan pärstäyksilöinti
            henkilo.setYksiloity(false);

            yksilointitietoRepository.findByHenkilo(henkilo).ifPresent(yksilointitietoRepository::delete);
            yksilointivirheRepository.findByHenkilo(henkilo).ifPresent(yksilointivirheRepository::delete);
        }

        return henkiloModificationService.update(henkilo);
    }

    private NimienYhtenevyys tarkistaNimet(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo, Set<String> kaikkiSukunimet) {
        boolean etunimiMatch = false;
        JaroWinklerDistance stringEvaluator = new JaroWinklerDistance();

        boolean sukunimiMatch = kaikkiSukunimet.stream()
                .map(sukunimi -> stringEvaluator.getDistance(henkilo.getSukunimi().toLowerCase(), sukunimi.toLowerCase()))
                .anyMatch(distance -> distance >= oppijanumerorekisteriProperties.getSukunimiThreshold());

        if (yksiloityHenkilo.getEtunimi().toLowerCase().contains(henkilo.getKutsumanimi().toLowerCase())) {
            etunimiMatch = true;
        }
        else {
            String[] etunimet = yksiloityHenkilo.getEtunimi().toLowerCase().split(" ");
            for (String etunimi : etunimet) {
                if (stringEvaluator.getDistance(henkilo.getKutsumanimi().toLowerCase(), etunimi)
                        > oppijanumerorekisteriProperties.getEtunimiThreshold()) {
                    etunimiMatch = true;
                    break;
                }
            }
        }

        return new NimienYhtenevyys(etunimiMatch, sukunimiMatch);
    }

    private static class NimienYhtenevyys {
        final boolean etunimimatch;
        final boolean sukunimimatch;

        private NimienYhtenevyys(boolean etunimimatch, boolean sukunimimatch) {
            this.etunimimatch = etunimimatch;
            this.sukunimimatch = sukunimimatch;
        }

    }

    private void addYksilointitietosWhenNamesDoNotMatch(final Henkilo henkilo, final YksiloityHenkilo yksiloityHenkilo) {
        Yksilointitieto yksilointitieto = yksilointitietoRepository.findByHenkilo(henkilo)
                .orElseGet(Yksilointitieto::new);

        yksilointitieto.setEtunimet(yksiloityHenkilo.getEtunimi());
        yksilointitieto.setKutsumanimi(yksiloityHenkilo.getKutsumanimi());
        yksilointitieto.setSukunimi(yksiloityHenkilo.getSukunimi());
        yksilointitieto.setSukupuoli(maaritaSukupuoli(yksiloityHenkilo));
        yksilointitieto.setKotikunta(yksiloityHenkilo.getKotikunta());
        yksilointitieto.setTurvakielto(yksiloityHenkilo.isTurvakielto());

        Optional.ofNullable(yksiloityHenkilo.getKansalaisuusKoodit()).filter(collectionNotEmpty)
                .map(this::findOrCreateKansalaisuus)
                .ifPresent(kansalaisuusKoodis -> kansalaisuusKoodis.forEach(yksilointitieto::addKansalaisuus));

        Optional.ofNullable(yksiloityHenkilo.getAidinkieliKoodi()).filter(stringNotEmpty)
                .map(kielisyysRepository::findOrCreateByKoodi)
                .ifPresent(yksilointitieto::setAidinkieli);

        yksilointitieto.clearYhteystiedotRyhma();
        Optional.of(yksiloityHenkilo)
                .filter(yHenkilo -> (yHenkilo.getOsoitteet() != null && !yHenkilo.getOsoitteet().isEmpty()) ||
                        !StringUtils.isEmpty(yHenkilo.getSahkoposti()))
                .filter(yHenkilo -> isOppija(henkilo.getOidHenkilo()))
                .map(yHenkilo -> addYhteystiedot(yHenkilo, henkilo.getAsiointiKieli()))
                .ifPresent(yhteystiedotRyhmas -> yhteystiedotRyhmas.forEach(yksilointitieto::addYhteystiedotRyhma));

        yksilointitieto.setHenkilo(henkilo);
        yksilointitietoRepository.save(yksilointitieto);
    }

    private String maaritaSukupuoli(YksiloityHenkilo yksiloityHenkilo) {
        if(StringUtils.isEmpty(yksiloityHenkilo.getSukupuoli())) {
            return HetuUtils.sukupuoliFromHetu(yksiloityHenkilo.getHetu());
        } else {
            return yksiloityHenkilo.getSukupuoli();
        }
    }

    private Set<Kansalaisuus> findOrCreateKansalaisuus(@NotNull List<String> kansalaisuusKoodit) {
        return kansalaisuusKoodit.stream()
                .filter(kansalaisuusKoodi ->
                        isKansalaisuusKoodiValid(Collections.singletonList(kansalaisuusKoodi)))
                .map(kansalaisuusRepository::findOrCreate).collect(Collectors.toSet());
    }

    private Set<YhteystiedotRyhma> addYhteystiedot(YksiloityHenkilo yksiloityHenkilo, Kielisyys asiointiKieli) {
        Set<YhteystiedotRyhma> newYhteystiedot = new HashSet<>();

        Optional.ofNullable(yksiloityHenkilo.getOsoitteet()).filter(collectionNotEmpty)
                .ifPresent(osoiteTietos -> osoiteTietos.forEach(osoiteTieto -> {
                    Set<Yhteystieto> yhteystietoSet = getYhteystietos(asiointiKieli, osoiteTieto);

                    newYhteystiedot.add(YhteystiedotRyhma.builder().ryhmaKuvaus(osoiteTieto.getTyyppi())
                            .ryhmaAlkuperaTieto(RYHMAALKUPERA_VTJ).readOnly(true).yhteystieto(yhteystietoSet).build());
                }));

        if (!StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti())) {
            Yhteystieto yt = Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, yksiloityHenkilo.getSahkoposti()).build();
            YhteystiedotRyhma sahkYhtTieto = YhteystiedotRyhma.builder().ryhmaKuvaus(RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE)
                    .ryhmaAlkuperaTieto(RYHMAALKUPERA_VTJ).readOnly(true).yhteystieto(yt).build();
            newYhteystiedot.add(sahkYhtTieto);
        }

        return newYhteystiedot.stream().filter(YhteystiedotRyhma::isNotEmpty).collect(toSet());
    }

    private Set<Yhteystieto> getYhteystietos(Kielisyys asiointiKieli, YksiloityHenkilo.OsoiteTieto ot) {
        Set<Yhteystieto> yhteystietoSet = new HashSet<>();

        yhteystietoSet.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
                getYhteystietoArvoByAsiointikieli(asiointiKieli, ot.getKatuosoiteR(), ot.getKatuosoiteS())).build());

        Optional.ofNullable(ot.getPostinumero()).ifPresent(postiNumero ->
                yhteystietoSet.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, postiNumero).build()));

        yhteystietoSet.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI,
                getYhteystietoArvoByAsiointikieli(asiointiKieli, ot.getKaupunkiR(), ot.getKaupunkiS())).build());

        yhteystietoSet.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_MAA,
                getYhteystietoArvoByAsiointikieli(asiointiKieli, ot.getMaaR(), ot.getMaaS())).build());

        return yhteystietoSet;
    }

    private String getYhteystietoArvoByAsiointikieli(Kielisyys asiointiKieli, String yhteystietoR, String yhteystietoS) {
        return Optional.ofNullable(yhteystietoR)
                .filter(yhteystieto -> asiointiKieli != null && asiointiKieli.getKieliKoodi().equals(KIELIKOODI_SV))
                .filter(yhteystieto -> !StringUtils.isEmpty(yhteystietoR) || StringUtils.isEmpty(yhteystietoS))
                .orElse(yhteystietoS);
    }

    private void paivitaHenkilonTiedotVTJnTiedoilla(final Henkilo henkilo, final YksiloityHenkilo yksiloityHenkilo) {

        henkilo.setOppijanumero(henkilo.getOidHenkilo());

        // Hetu has changed. If someone already has the new hetu remove it and link henkilos.
        if (StringUtils.hasLength(yksiloityHenkilo.getHetu()) && !yksiloityHenkilo.getHetu().equals(henkilo.getHetu())) {
            this.duplicateService.removeDuplicateHetuAndLink(henkilo.getOidHenkilo(), yksiloityHenkilo.getHetu());
            henkilo.setHetu(yksiloityHenkilo.getHetu());
        }

        updateIfYksiloityValueNotNull(henkilo.getEtunimet(), yksiloityHenkilo.getEtunimi(),henkilo::setEtunimet);
        updateIfYksiloityValueNotNull(henkilo.getSukunimi(), yksiloityHenkilo.getSukunimi(), henkilo::setSukunimi);
        // Sometimes this might null or empty in VTJ data, in that case the original value is kept
        updateIfYksiloityValueNotNull(henkilo.getKutsumanimi(), yksiloityHenkilo.getKutsumanimi(), henkilo::setKutsumanimi);

        Optional.ofNullable(yksiloityHenkilo.getAidinkieliKoodi()).filter(stringNotEmpty)
                .ifPresent(kieliKoodi -> henkilo.setAidinkieli(kielisyysRepository.findOrCreateByKoodi(kieliKoodi)));

        henkilo.setTurvakielto(yksiloityHenkilo.isTurvakielto());
        henkilo.setSyntymaaika(HetuUtils.dateFromHetu(yksiloityHenkilo.getHetu()));

        //Override VTJ-based address data.
        removeVtjYhteystiedotAndUpdateForOppija(henkilo, yksiloityHenkilo);

        Optional.ofNullable(yksiloityHenkilo.getKansalaisuusKoodit()).filter(collectionNotEmpty)
                .ifPresent(kansalaisuuskoodis -> {
                    henkilo.clearKansalaisuus();
                    findOrCreateKansalaisuus(kansalaisuuskoodis).forEach(henkilo::addKansalaisuus);
                });

        henkilo.setSukupuoli(maaritaSukupuoli(yksiloityHenkilo));
        henkilo.setKotikunta(yksiloityHenkilo.getKotikunta());
    }

    private void removeVtjYhteystiedotAndUpdateForOppija(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {
        Iterator<YhteystiedotRyhma> iterator = henkilo.getYhteystiedotRyhma().iterator();
        iterator.forEachRemaining(yhteystiedotRyhmaI -> Optional.ofNullable(yhteystiedotRyhmaI)
                .filter(yhteystiedotRyhma -> RYHMAALKUPERA_VTJ.equals(yhteystiedotRyhma.getRyhmaAlkuperaTieto()))
                .ifPresent(yhteystiedotRyhma -> {
                    yhteystiedotRyhma.getYhteystieto().forEach(yhteystietoRepository::delete);
                    yhteystiedotRyhma.clearYhteystieto();
                    yhteystiedotRyhmaRepository.delete(yhteystiedotRyhmaI);
                    iterator.remove();
                }));
        if (isOppija(henkilo.getOidHenkilo()) && (!CollectionUtils.isEmpty(yksiloityHenkilo.getOsoitteet()) || !StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti()))) {
            henkilo.addAllYhteystiedotRyhmas(addYhteystiedot(yksiloityHenkilo, henkilo.getAsiointiKieli()));
        }
    }

    private boolean isKansalaisuusKoodiValid(List<String> kansalaisuusKoodiList) {
        List<String> koodiTypeList = koodistoClient.getKoodiValuesForKoodisto("maatjavaltiot2", 1, true);
        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        return !(kansalaisuusKoodiList != null && !kansalaisuusKoodiList.stream()
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.equals(kansalaisuus))));
    }

    private void updateIfYksiloityValueNotNull(final String original, final String yksiloityValue, Consumer<String> consumer) {
        Optional.ofNullable(yksiloityValue)
                .filter(stringNotEmpty)
                .filter(hetu -> !hetu.equals(original))
                .ifPresent(consumer);
    }

    @Override
    @Transactional
    public Henkilo puraHeikkoYksilointi(final String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        if (!henkilo.isYksiloity()) {
            throw new ValidationException("Yksilöintiä ei voi purkaa koska henkilöä ei ole yksilöity");
        }

        if (!StringUtils.isEmpty(henkilo.getHetu()) || henkilo.isYksiloityVTJ()) {
            throw new ValidationException("Henkilöllä on hetu tai se on VTJ yksilöity, yksilöintiä ei voida purkaa");
        }

        henkilo.setYksiloity(false);
        return henkiloModificationService.update(henkilo);
    }

    @Override
    @Transactional
    public void paivitaYksilointitiedot(String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        if (!henkilo.isYksiloityVTJ()) {
            throw new ValidationException("Henkilöä " + henkiloOid + " ei ole yksilöity");
        }

        String hetu = henkilo.getHetu();
        if (hetu == null || hetu.isEmpty()) {
            throw new DataInconsistencyException("Henkilöllä " + henkiloOid + " ei ole hetua vaikka yksilöinti on suoritettu");
        }
        YksiloityHenkilo yksiloityHenkilo = vtjClient.fetchHenkilo(hetu)
                .orElseThrow(() -> new DataInconsistencyException("Henkilöä ei löydy VTJ:stä hetulla " + hetu));

        logger.info("Päivitetään tiedot VTJ:stä hetulle: {}", hetu);
        this.paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);
        henkilo.setVtjsynced(new Date());
        henkiloModificationService.update(henkilo);
    }

    @Override
    @Transactional
    public YksilointitietoDto getYksilointiTiedot(String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        Optional<Yksilointitieto> yksilointitieto = yksilointitietoRepository.findByHenkilo(henkilo);
        return yksilointitieto.map(y -> this.mapper.map(y, YksilointitietoDto.class)).orElseGet(YksilointitietoDto::new);
    }

    @Override
    @Transactional
    public void yliajaHenkilonTiedot(String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        Yksilointitieto yksilointitieto = yksilointitietoRepository.findByHenkilo(henkilo)
                .orElseThrow(() -> new ValidationException("No VTJ-data found for henkilo"));

        henkilo.setOppijanumero(henkilo.getOidHenkilo());
        henkilo.setEtunimet(yksilointitieto.getEtunimet());
        henkilo.setSukunimi(yksilointitieto.getSukunimi());
        henkilo.setSukupuoli(yksilointitieto.getSukupuoli());
        henkilo.setKotikunta(yksilointitieto.getKotikunta());
        henkilo.setYksiloityVTJ(true);
        henkilo.setYksiloity(false);
        henkilo.setTurvakielto(yksilointitieto.isTurvakielto());

        if(!StringUtils.isEmpty(yksilointitieto.getKutsumanimi())) {
            henkilo.setKutsumanimi(yksilointitieto.getKutsumanimi());
        }

        if (yksilointitieto.getAidinkieli() != null) {
            henkilo.setAidinkieli(yksilointitieto.getAidinkieli());
            yksilointitieto.setAidinkieli(null);
        }

        if (yksilointitieto.getKansalaisuus() != null && !yksilointitieto.getKansalaisuus().isEmpty()) {
            henkilo.setKansalaisuus(new HashSet<>(yksilointitieto.getKansalaisuus()));
            yksilointitieto.setKansalaisuus(new HashSet<>());
        }

        if (yksilointitieto.getYhteystiedotRyhma() != null && !yksilointitieto.getYhteystiedotRyhma().isEmpty()) {
            henkilo.getYhteystiedotRyhma().addAll(yksilointitieto.getYhteystiedotRyhma());
            yksilointitieto.setYhteystiedotRyhma(new HashSet<>());
        }

        yksilointitietoRepository.delete(yksilointitieto);
        henkiloModificationService.update(henkilo);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<YksilointiVertailuDto> listEpaonnistunutYksilointi(int page, int count) {
        YksilointitietoCriteria criteria = new YksilointitietoCriteria();
        criteria.setPassivoitu(false);
        criteria.setDuplikaatti(false);
        criteria.setOnHetu(true);
        criteria.setYksiloityVtj(false);
        logger.info("Haetaan epäonnistuneet yksilöinnit {} (sivu: {}, määrä: {})", criteria, page, count);

        int limit = count;
        int offset = (page - 1) * count;
        Iterable<Yksilointitieto> entities = yksilointitietoRepository.findBy(criteria, limit, offset);
        long total = yksilointitietoRepository.countBy(criteria);

        List<YksilointiVertailuDto> dtos = StreamSupport.stream(entities.spliterator(), false)
                .map(this::yksilointietoToVertailuDto)
                .collect(toList());
        return Page.of(page, count, dtos, total);
    }

    private YksilointiVertailuDto yksilointietoToVertailuDto(Yksilointitieto yksilointitieto) {
        YksilointiVertailuDto dto = new YksilointiVertailuDto();
        dto.setOppijanumerorekisteri(mapper.map(yksilointitieto.getHenkilo(), HenkiloOidHetuNimiDto.class));
        dto.setVaestotietojarjestelma(mapper.map(yksilointitieto, NimiDto.class));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<String> listPalvelutunnisteet(String oid) {
        Henkilo henkilo = getHenkiloByOid(oid);
        return asiayhteysPalveluRepository.findByHenkilo(henkilo).stream()
                .map(AsiayhteysPalvelu::getPalvelutunniste)
                .collect(toSet());
    }

    @Override
    @Transactional
    public void enableYksilointi(String oid, String palvelutunniste) {
        Henkilo henkilo = getHenkiloByOid(oid);
        if (!asiayhteysPalveluRepository.findByHenkiloAndPalvelutunniste(henkilo, palvelutunniste).isPresent()) {
            AsiayhteysPalvelu asiayhteys = new AsiayhteysPalvelu(henkilo, palvelutunniste, new Date());
            asiayhteysPalveluRepository.save(asiayhteys);
            henkiloModificationService.update(henkilo);
        }
    }

    @Override
    @Transactional
    public void disableYksilointi(String oid, String palvelutunniste) {
        Henkilo henkilo = getHenkiloByOid(oid);
        asiayhteysPalveluRepository.findByHenkiloAndPalvelutunniste(henkilo, palvelutunniste).ifPresent(asiayhteys -> {
            asiayhteysPalveluRepository.delete(asiayhteys);
            henkiloModificationService.update(henkilo);
        });
    }

    @Override
    @Transactional
    public void enableYksilointi(String oid, AsiayhteysHakemusDto dto) {
        Henkilo henkilo = getHenkiloByOid(oid);
        AsiayhteysHakemus entity = asiayhteysHakemusRepository
                .findByHenkiloAndHakemusOid(henkilo, dto.getHakemusOid())
                .orElseGet(() -> new AsiayhteysHakemus(henkilo));
        mapper.map(dto, entity);
        asiayhteysHakemusRepository.save(entity);
        henkiloModificationService.update(henkilo);
    }

    @Override
    @Transactional
    public void enableYksilointi(String oid, AsiayhteysKayttooikeusDto dto) {
        Henkilo henkilo = getHenkiloByOid(oid);
        AsiayhteysKayttooikeus entity = asiayhteysKayttooikeusRepository.findByHenkilo(henkilo)
                .orElseGet(() -> new AsiayhteysKayttooikeus(henkilo));
        mapper.map(dto, entity);
        asiayhteysKayttooikeusRepository.save(entity);
        henkiloModificationService.update(henkilo);
    }

    private boolean isOppija(String oid) {
        return kayttooikeusClient.getKayttajaByOid(oid).map(KayttajaReadDto::isOppija).orElse(true);
    }

}
