package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.*;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YksilointitietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService.LinkResult;
import fi.vm.sade.oppijanumerorekisteri.utils.TextUtils;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.KoodiValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.KutsumanimiValidator;
import fi.vm.sade.rajapinnat.vtj.api.Huoltaja;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.search.spell.JaroWinklerDistance;
import org.apache.lucene.search.spell.StringDistance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.stream.Collectors.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class YksilointiServiceImpl implements YksilointiService {
    public static final String RYHMAALKUPERA_VTJ = "alkupera1";
    private static final Logger logger = LoggerFactory.getLogger(YksilointiService.class);
    private static final String KIELIKOODI_SV = "sv";
    private static final String RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE = "yhteystietotyyppi8";

    private static final Predicate<String> stringNotEmpty = it -> StringUtils.hasLength(it);
    private static final Predicate<Collection<?>> collectionNotEmpty = it -> !CollectionUtils.isEmpty(it);

    private final DuplicateService duplicateService;
    private final KoodistoService koodistoService;

    private final HenkiloRepository henkiloRepository;
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
    private final KayttooikeusClient kayttooikeusClient;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    private final StringDistance stringDistance = new JaroWinklerDistance();

    static boolean isFakeHetu(String hetu) {
        return hetu.charAt(7) == '9';
    }

    private Henkilo getHenkiloByOid(String oid) {
        return henkiloRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("Henkilo not found by oid " + oid));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void yksiloiAutomaattisesti(final String henkiloOid) {
        henkiloRepository.findByOidHenkilo(henkiloOid).ifPresent(this::yksiloiAutomaattisesti);
    }

    private void yksiloiAutomaattisesti(Henkilo henkilo) {
        if (StringUtils.isEmpty(henkilo.getHetu())) {
            logger.warn("Henkilöä '{}' ei voida yksilöidä koska hetu puuttuu", henkilo.getOidHenkilo());
            return;
        }
        yksiloiHenkilo(henkilo);
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
        if (!(exception instanceof SuspendableIdentificationException)) {
            Integer uusiYritysmaara = Optional.ofNullable(yksilointivirhe.getUudelleenyritysMaara())
                    .map(maara -> ++maara)
                    .orElse(0);
            yksilointivirhe.setUudelleenyritysMaara(uusiYritysmaara);
            yksilointivirhe.setUudelleenyritysAikaleima(this.getUudelleenyritysAikaleima(uusiYritysmaara));
        } else {
            yksilointivirhe.setUudelleenyritysAikaleima(null);
            yksilointivirhe.setUudelleenyritysMaara(null);
        }
        yksilointivirheRepository.save(yksilointivirhe);
    }

    private Date getUudelleenyritysAikaleima(Integer uusiYritysmaara) {
        LocalDateTime uusiAikaleima;
        // Limit the exponential result to ~month (41 days)
        if (uusiYritysmaara > 9) {
            uusiAikaleima = LocalDateTime.now().plusMonths(1L);
        } else {
            Function<Integer, Integer> exponentialFunction = maara -> (int) Math.pow(maara, 5) + 10;
            uusiAikaleima = LocalDateTime.now().plusMinutes(exponentialFunction.apply(uusiYritysmaara));
        }
        return Date.from(uusiAikaleima.atZone(ZoneId.systemDefault()).toInstant());
    }

    @Override
    @Transactional
    public Henkilo yksiloiManuaalisesti(final String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);
        if (StringUtils.isEmpty(henkilo.getHetu())) {
            throw new ValidationException(String.format("Henkilöä '%s' ei voida yksilöidä koska hetu puuttuu", henkilo.getOidHenkilo()));
        }
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
        return henkiloModificationService.update(henkilo);
    }

    private @NotNull Henkilo yksiloiHenkilo(@NotNull final Henkilo henkilo) {
        if (isFakeHetu(henkilo.getHetu())) {
            throw new SuspendableIdentificationException("Henkilön hetu ei ole oikea: " + henkilo.getHetu());
        }

        YksiloityHenkilo yksiloityHenkilo = vtjClient.fetchHenkilo(henkilo.getHetu())
                .orElseThrow(() ->
                        new SuspendableIdentificationException("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: " + henkilo.getHetu()));

        if (yksiloityHenkilo.isPassivoitu()) {
            throw new SuspendableIdentificationException("Henkilön hetu on passivoitu: " + henkilo.getHetu());
        }

        yksilointivirheRepository.findByHenkilo(henkilo).ifPresent(yksilointivirheRepository::delete);
        henkilo.setYksilointiYritetty(true);

        if (this.yhtenevyysTarkistus(henkilo, yksiloityHenkilo)) {
            this.addYksilointitietosWhenNamesDoNotMatch(henkilo, yksiloityHenkilo);
            return henkiloModificationService.update(henkilo);
        } else {
            // If VTJ data differs from the user's data, VTJ must overwrite
            // those values since VTJ's data is considered more reliable
            LinkResult linked = this.paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);
            if (linked.master.equals(henkilo)) {
                henkilo.setYksiloityVTJ(true);
                //OPHASPA-1820 kumotaan pärstäyksilöinti
                henkilo.setYksiloity(false);

                yksilointitietoRepository.findByHenkilo(henkilo).ifPresent(yksilointitietoRepository::delete);
            }
            linked.forEachModified(henkiloModificationService::update);
            logger.info("Henkilön yksilöinti onnistui hetulle: {}", henkilo.getHetu());
        }

        return henkilo;
    }

    // Palauttaa tiedon ovatko henkilön nimet epävastaavia VTJ-datan kanssa.
    private boolean yhtenevyysTarkistus(@NotNull Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {
        if (StringUtils.hasLength(henkilo.getHetu()) && StringUtils.isEmpty(henkilo.getSukunimi()) && StringUtils.isEmpty(henkilo.getEtunimet())) {
            return false;
        }
        Set<String> kaikkiSukunimet = Stream.concat(Stream.of(yksiloityHenkilo.getSukunimi()),
                        Optional.ofNullable(yksiloityHenkilo.getEntisetNimet()).orElseGet(Collections::emptyList)
                                .stream()
                                .filter(YksiloityHenkilo.EntinenNimi::isSukunimi)
                                .map(YksiloityHenkilo.EntinenNimi::getArvo))
                .filter(Objects::nonNull)
                .collect(toCollection(LinkedHashSet::new));
        boolean nimetEivatVastaa = !tarkistaNimet(henkilo, yksiloityHenkilo, kaikkiSukunimet);
        if (nimetEivatVastaa) {
            logger.info("Henkilön tiedot eivät täsmää VTJ-tietoon\n--OID: " + henkilo.getOidHenkilo() + "\n"
                    + "--Annetut etunimet: " + henkilo.getEtunimet() + ", VTJ: " + yksiloityHenkilo.getEtunimi() + "\n"
                    + "--Annettu kutsumanimi: " + henkilo.getKutsumanimi() + ", VTJ: " + yksiloityHenkilo.getKutsumanimi() + "\n"
                    + "--Annettu sukunimi: " + henkilo.getSukunimi() + ", VTJ (ml. entiset): " + String.join(", ", kaikkiSukunimet));
        }
        return nimetEivatVastaa;
    }

    protected boolean tarkistaNimet(Henkilo onrHenkilo, YksiloityHenkilo vtjHenkilo, Set<String> kaikkiSukunimet) {
        String onrSukunimi = normalize(onrHenkilo.getSukunimi());
        String onrEtunimet = normalize(onrHenkilo.getEtunimet());

        Set<String> vtjSukunimet = kaikkiSukunimet.stream()
                .map(this::normalize)
                .collect(toSet());
        String vtjEtunimi = normalize(vtjHenkilo.getEtunimi());

        return vtjSukunimet.stream().anyMatch(vtjSukunimi -> tarkistaSukunimi(onrSukunimi, vtjSukunimi))
                && tarkistaEtunimi(onrEtunimet, vtjEtunimi)
                // joistakin järjestelmistä tulee etunimi ja sukunimi väärissä kentissä
                || vtjSukunimet.stream().anyMatch(vtjSukunimi -> tarkistaSukunimi(onrEtunimet, vtjSukunimi))
                && tarkistaEtunimi(onrSukunimi, vtjEtunimi);
    }

    protected String normalize(@NotNull final String input) {
        return TextUtils.normalize(input).toLowerCase();
    }

    private String name(String input) {
        return Optional.ofNullable(input).map(this::normalize).orElse("");
    }

    @Override
    public boolean isSimilar(String a, String b) {
        return isSimilar(name(a), name(b), oppijanumerorekisteriProperties.getEtunimiThreshold());
    }

    private boolean isSimilar(String a, String b, float threshold) {
        return stringDistance.getDistance(a, b) >= threshold;
    }

    protected boolean tarkistaSukunimi(String henkilo1sukunimi, String henkilo2sukunimi) {
        return isSimilar(name(henkilo1sukunimi), name(henkilo2sukunimi), oppijanumerorekisteriProperties.getSukunimiThreshold());
    }

    protected boolean tarkistaEtunimi(String kutsumanimi, String vtjEtunimet) {
        if (vtjEtunimet.contains(kutsumanimi)) {
            return true;
        }
        List<String> vtjEtunimetSplit = HenkiloExistenceCheckDto.splitEtunimet(vtjEtunimet);
        List<String> kutsumanimiSplit = HenkiloExistenceCheckDto.splitEtunimet(kutsumanimi);
        return vtjEtunimetSplit.stream().anyMatch(vtjEtunimi ->
                kutsumanimiSplit.stream().anyMatch(k -> isSimilar(k, vtjEtunimi))
        );
    }

    private void addYksilointitietosWhenNamesDoNotMatch(final Henkilo henkilo, final YksiloityHenkilo yksiloityHenkilo) {
        Yksilointitieto yksilointitieto = yksilointitietoRepository.findByHenkilo(henkilo)
                .orElseGet(Yksilointitieto::new);

        yksilointitieto.setHetu(yksiloityHenkilo.getHetu());
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
                .filter(koodi -> KoodiValidator.isValid(koodistoService, Koodisto.KIELI, String::toLowerCase, koodi))
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
        if (StringUtils.isEmpty(yksiloityHenkilo.getSukupuoli())) {
            if (yksiloityHenkilo.getHetu() == null) {
                return null;
            }
            return HetuUtils.sukupuoliFromHetu(yksiloityHenkilo.getHetu());
        } else {
            return yksiloityHenkilo.getSukupuoli();
        }
    }

    private Set<Kansalaisuus> findOrCreateKansalaisuus(@NotNull List<String> kansalaisuusKoodit) {
        return kansalaisuusKoodit.stream()
                .filter(kansalaisuusKoodi ->
                        KoodiValidator.isValid(koodistoService, Koodisto.MAAT_JA_VALTIOT_2, kansalaisuusKoodi))
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

    private LinkResult paivitaHenkilonTiedotVTJnTiedoilla(final Henkilo henkilo, final YksiloityHenkilo yksiloityHenkilo) {
        final String uusiHetu = yksiloityHenkilo.getHetu();
        LinkResult linked = kasitteleHetuMuutos(henkilo, uusiHetu);

        if (!linked.master.equals(henkilo)) {
            return linked;
        }

        updateIfYksiloityValueNotNull(henkilo.getEtunimet(), yksiloityHenkilo.getEtunimi(), henkilo::setEtunimet);
        updateIfYksiloityValueNotNull(henkilo.getSukunimi(), yksiloityHenkilo.getSukunimi(), henkilo::setSukunimi);
        // Sometimes this might null or empty in VTJ data, in that case the original value is kept
        updateIfYksiloityValueNotNull(henkilo.getKutsumanimi(), yksiloityHenkilo.getKutsumanimi(), henkilo::setKutsumanimi);

        KutsumanimiValidator kutsumanimiValidator = new KutsumanimiValidator(henkilo.getEtunimet());
        if (!kutsumanimiValidator.isValid(henkilo.getKutsumanimi())) {
            henkilo.setKutsumanimi(henkilo.getEtunimet());
        }

        Optional.ofNullable(yksiloityHenkilo.getAidinkieliKoodi()).filter(stringNotEmpty)
                .filter(koodi -> KoodiValidator.isValid(koodistoService, Koodisto.KIELI, String::toLowerCase, koodi))
                .ifPresent(kieliKoodi -> henkilo.setAidinkieli(kielisyysRepository.findOrCreateByKoodi(kieliKoodi)));

        henkilo.setTurvakielto(yksiloityHenkilo.isTurvakielto());
        henkilo.setSyntymaaika(HetuUtils.dateFromHetu(uusiHetu));

        //Override VTJ-based address data.
        removeVtjYhteystiedotAndUpdateForOppija(henkilo, yksiloityHenkilo);

        Optional.ofNullable(yksiloityHenkilo.getKansalaisuusKoodit()).filter(collectionNotEmpty)
                .ifPresent(kansalaisuuskoodis -> {
                    henkilo.clearKansalaisuus();
                    findOrCreateKansalaisuus(kansalaisuuskoodis).forEach(henkilo::addKansalaisuus);
                });

        henkilo.setSukupuoli(maaritaSukupuoli(yksiloityHenkilo));
        henkilo.setKotikunta(yksiloityHenkilo.getKotikunta());

        // Always clear/replace the current ones.
        Set<HenkiloHuoltajaSuhde> huoltajat = Optional.ofNullable(yksiloityHenkilo.getHuoltajat())
                .filter(collectionNotEmpty)
                .map(huoltajas -> huoltajas.stream()
                        .map(this::huoltajaToHuoltajaCreateDto)
                        .map(huoltaja -> HenkiloHuoltajaSuhde.builder()
                                .lapsi(henkilo)
                                .huoltaja(this.henkiloModificationService.findOrCreateHuoltaja(huoltaja, henkilo))
                                .alkuPvm(huoltaja.getHuoltajuusAlku())
                                .loppuPvm(huoltaja.getHuoltajuusLoppu())
                                .build())
                        .collect(Collectors.toSet()))
                .orElseGet(HashSet::new);
        henkilo.setHuoltajat(huoltajat);

        henkilo.setVtjsynced(new Date());

        return linked;
    }

    /**
     * Käsittelee yksilöinnissä tapahtuvan hetumuutoksen. Jos uudella hetulla löytyy jo <strong>yksilöity</strong>
     * henkilö, merkitään yksilöinnissä oleva henkilö uuden hetu omaavan henkilön duplikaatiksi. Muuten uusi hetu
     * poistetaan toiselta henkilöltä ja merkitään yksilöinnissä olevan henkilön duplikaatiksi.
     *
     * @param henkilo  yksilöinnissä oleva henkilö
     * @param uusiHetu yksilöinnissä olevan henkilön uusi hetu
     * @return mahdollisen linkityksen tulos
     */
    private LinkResult kasitteleHetuMuutos(Henkilo henkilo, String uusiHetu) {
        String nykyinenHetu = henkilo.getHetu();
        if (StringUtils.hasLength(uusiHetu) && (!uusiHetu.equals(nykyinenHetu)
                || henkiloRepository.findByKaikkiHetut(uusiHetu)
                .map(henkiloByHetu -> !henkiloByHetu.equals(henkilo)).orElse(false))) {
            LinkResult linked = duplicateService.linkWithHetu(henkilo, uusiHetu);
            if (linked.master.equals(henkilo)) {
                henkilo.setHetu(uusiHetu);
                henkilo.addHetu(nykyinenHetu, uusiHetu);
            } else {
                henkilo.removeHetu(nykyinenHetu, uusiHetu);
                linked.master.addHetu(nykyinenHetu, uusiHetu);
            }
            return linked;
        } else {
            henkilo.addHetu(nykyinenHetu);
            return new LinkResult(henkilo, Collections.singletonList(henkilo), new ArrayList<>());
        }
    }

    private HuoltajaCreateDto huoltajaToHuoltajaCreateDto(Huoltaja huoltaja) {
        // kansalaisuus jne tiedot ei löydy vtj soso rajapinnan skeemasta
        return HuoltajaCreateDto.builder()
                .hetu(huoltaja.getHetu())
                .etunimet(huoltaja.getEtunimi())
                .kutsumanimi(huoltaja.getEtunimi())
                .sukunimi(huoltaja.getSukunimi())
                .build();
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
        LinkResult linked = this.paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);
        linked.forEachModified(henkiloModificationService::update);
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

        final String uusiHetu = henkilo.getHetu();
        LinkResult linked = kasitteleHetuMuutos(henkilo, yksilointitieto.getHetu());

        if (!linked.master.equals(henkilo)) {
            yksilointitietoRepository.delete(yksilointitieto);
            linked.forEachModified(henkiloModificationService::update);
            return;
        }

        henkilo.setEtunimet(yksilointitieto.getEtunimet());
        henkilo.setSukunimi(yksilointitieto.getSukunimi());
        if (HetuUtils.hetuIsValid(uusiHetu)) {
            henkilo.setSyntymaaika(HetuUtils.dateFromHetu(uusiHetu));
        }
        henkilo.setSukupuoli(yksilointitieto.getSukupuoli());

        henkilo.setKotikunta(yksilointitieto.getKotikunta());
        henkilo.setYksiloityVTJ(true);
        henkilo.setYksiloity(false);
        henkilo.setTurvakielto(yksilointitieto.isTurvakielto());

        if (!StringUtils.isEmpty(yksilointitieto.getKutsumanimi())) {
            henkilo.setKutsumanimi(yksilointitieto.getKutsumanimi());
        }

        KutsumanimiValidator kutsumanimiValidator = new KutsumanimiValidator(henkilo.getEtunimet());
        if (!kutsumanimiValidator.isValid(henkilo.getKutsumanimi())) {
            henkilo.setKutsumanimi(henkilo.getEtunimet());
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
        linked.forEachModified(henkiloModificationService::update);
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

    @Override
    public Optional<String> exists(final HenkiloExistenceCheckDto details) {
        return henkiloRepository.findByHetu(details.getHetu())
                .map(henkilo -> compareOnrDetails(henkilo, details))
                .orElseGet(() ->
                        vtjClient.fetchHenkilo(details.getHetu())
                                .map(henkilo -> compareVtjDetails(henkilo, details))
                                .orElseThrow(NotFoundException::new));
    }

    private Optional<String> compareOnrDetails(final Henkilo henkilo, final HenkiloExistenceCheckDto details) {
        if (detailsMatch(henkilo.getEtunimet(), henkilo.getSukunimi(), details))
            return Optional.of(henkilo.getOidHenkilo());
        throw new ConflictException();
    }

    private Optional<String> compareVtjDetails(final YksiloityHenkilo vtjHenkilo, final HenkiloExistenceCheckDto details) {
        if (detailsMatch(vtjHenkilo.getEtunimi(), vtjHenkilo.getSukunimi(), details))
            return Optional.empty();

        reportConflict(vtjHenkilo, details);
        throw new ConflictException();
    }

    private void reportConflict(YksiloityHenkilo henkilo, HenkiloExistenceCheckDto details) {
        log.info("VTJ name comparison failed! input: \"{}, {}\" vtj: \"{}, {}\"",
                details.getEtunimet(), details.getSukunimi(),
                henkilo.getEtunimi(), henkilo.getSukunimi());
    }

    private boolean detailsMatch(final String firstName, final String lastName, final HenkiloExistenceCheckDto details) {
        return namesMatch(details.getEtunimet(), details.getSukunimi(), firstName, lastName);
    }

    public boolean namesMatch(
            String givenEtunimet, String givenSukunimi,
            String expectedEtunimet, String expectedSukunimi
    ) {
        return tarkistaSukunimi(name(givenSukunimi), name(expectedSukunimi)) && tarkistaEtunimi(name(givenEtunimet), name(expectedEtunimet));
    }

    private boolean isOppija(String oid) {
        return kayttooikeusClient.getKayttajaByOid(oid).map(KayttajaReadDto::isOppija).orElse(true);
    }
}
