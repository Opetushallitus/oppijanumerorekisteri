package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.apache.lucene.search.spell.JaroWinklerDistance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import static java.util.stream.Collectors.toSet;

@Service
public class YksilointiServiceImpl implements YksilointiService {
    private static final Logger logger = LoggerFactory.getLogger(YksilointiService.class);
    private static final String KIELIKOODI_SV = "sv";

    private final YksilointitietoRepository yksilointitietoRepository;
    private final HenkiloRepository henkiloRepository;
    private final KansalaisuusRepository kansalaisuusRepository;
    private final KielisyysRepository kielisyysRepository;
    private final YhteystietoRepository yhteystietoRepository;
    private final YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository;

    private final UserDetailsHelper userDetailsHelper;

    private final VtjClient vtjClient;
    private final KoodistoClient koodistoClient;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    public static final String RYHMAALKUPERA_VTJ = "alkupera1";
    private static final String RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE = "yhteystietotyyppi8";

    private static final Predicate<String> stringNotEmpty = it -> !StringUtils.isEmpty(it);
    private static final Predicate<Collection> collectionNotEmpty = it -> !CollectionUtils.isEmpty(it);

    @Autowired
    public YksilointiServiceImpl(HenkiloRepository henkiloRepository,
                                 YksilointitietoRepository yksilointitietoRepository,
                                 UserDetailsHelper userDetailsHelper,
                                 VtjClient vtjClient,
                                 KoodistoClient koodistoClient,
                                 OppijanumerorekisteriProperties oppijanumerorekisteriProperties,
                                 KansalaisuusRepository kansalaisuusRepository,
                                 KielisyysRepository kielisyysRepository,
                                 YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository,
                                 YhteystietoRepository yhteystietoRepository) {
        this.henkiloRepository = henkiloRepository;
        this.yksilointitietoRepository = yksilointitietoRepository;
        this.userDetailsHelper = userDetailsHelper;
        this.vtjClient = vtjClient;
        this.oppijanumerorekisteriProperties = oppijanumerorekisteriProperties;
        this.kansalaisuusRepository = kansalaisuusRepository;
        this.kielisyysRepository = kielisyysRepository;
        this.koodistoClient = koodistoClient;
        this.yhteystiedotRyhmaRepository = yhteystiedotRyhmaRepository;
        this.yhteystietoRepository = yhteystietoRepository;
    }

    private Henkilo getHenkiloByOid(String oid) {
        return this.henkiloRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("Henkilo not found by oid " + oid));
    }

    private Henkilo saveHenkilo(Henkilo henkilo) {
        henkilo.setModified(new Date());
        henkilo.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());
        return henkiloRepository.save(henkilo);
    }

    @Override
    @Transactional
    public Henkilo yksiloiManuaalisesti(final String henkiloOid) {
        Henkilo henkilo = getHenkiloByOid(henkiloOid);

        if (!StringUtils.isEmpty(henkilo.getHetu())) {
            henkilo = yksiloiHenkilo(henkilo);
        }

        // Remove yksilointitieto if henkilo was yksiloity succesfully.
        if (henkilo != null && henkilo.isYksiloityVTJ() && henkilo.getYksilointitieto() != null) {
            this.yksilointitietoRepository.delete(henkilo.getYksilointitieto());
            henkilo.setYksilointitieto(null);
            henkilo.setModified(new Date());
        }

        return henkilo;
    }

    private @NotNull Henkilo yksiloiHenkilo(@NotNull final Henkilo henkilo) {
        /* VTJ data for Henkilo contains a huge data set and parsing this data
         * might change in the future, if Henkilo's data must contain all what
         * VTJ has to offer but that's still uncertain
         */
        YksiloityHenkilo yksiloityHenkilo = this.vtjClient.fetchHenkilo(henkilo.getHetu())
                .orElseThrow(() ->
                        new NotFoundException("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: " + henkilo.getHetu()));

        henkilo.setYksilointiYritetty(true);

        NimienYhtenevyys nimienYhtenevyys = tarkistaNimet(henkilo, yksiloityHenkilo);

        if (!nimienYhtenevyys.etunimimatch || !nimienYhtenevyys.sukunimimatch) {
            logger.info("Henkilön tiedot eivät täsmää VTJ-tietoon\n--OID: " + henkilo.getOidHenkilo() + "\n"
                    + "--Annetut etunimet: " + henkilo.getEtunimet() + ", VTJ: " + yksiloityHenkilo.getEtunimi() + "\n"
                    + "--Annettu kutsumanimi: " + henkilo.getKutsumanimi() + ", VTJ: " + yksiloityHenkilo.getKutsumanimi() + "\n"
                    + "--Annettu sukunimi: " + henkilo.getSukunimi() + ", VTJ: " + yksiloityHenkilo.getSukunimi());

            this.addYksilointitietosWhenNamesDoNotMatch(henkilo, yksiloityHenkilo);
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
        }

        return henkilo;
    }

    private NimienYhtenevyys tarkistaNimet(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {
        boolean etunimiMatch = false;
        JaroWinklerDistance stringEvaluator = new JaroWinklerDistance();
        float sukunimiMatch = stringEvaluator.getDistance(henkilo.getSukunimi().toLowerCase(),
                yksiloityHenkilo.getSukunimi().toLowerCase());

        if (yksiloityHenkilo.getEtunimi().toLowerCase().contains(henkilo.getKutsumanimi().toLowerCase())) {
            etunimiMatch = true;
        }
        else {
            String[] etunimet = yksiloityHenkilo.getEtunimi().toLowerCase().split(" ");
            for (String etunimi : etunimet) {
                if (stringEvaluator.getDistance(henkilo.getKutsumanimi(), etunimi)
                        > this.oppijanumerorekisteriProperties.getEtunimiThreshold()) {
                    etunimiMatch = true;
                    break;
                }
            }
        }

        return new NimienYhtenevyys(etunimiMatch, sukunimiMatch
                >= this.oppijanumerorekisteriProperties.getSukunimiThreshold());
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
        Yksilointitieto yksilointitieto = Optional.ofNullable(henkilo.getYksilointitieto())
                .orElseGet(Yksilointitieto::new);

        yksilointitieto.setEtunimet(yksiloityHenkilo.getEtunimi());
        yksilointitieto.setKutsumanimi(yksiloityHenkilo.getKutsumanimi());
        yksilointitieto.setSukunimi(yksiloityHenkilo.getSukunimi());
        yksilointitieto.setSukupuoli(this.maaritaSukupuoli(yksiloityHenkilo));
        yksilointitieto.setTurvakielto(yksiloityHenkilo.isTurvakielto());

        Optional.ofNullable(yksiloityHenkilo.getKansalaisuusKoodit()).filter(collectionNotEmpty)
                .map(this::findOrCreateKansalaisuus)
                .ifPresent(kansalaisuusKoodis -> kansalaisuusKoodis.forEach(yksilointitieto::addKansalaisuus));

        Optional.ofNullable(yksiloityHenkilo.getAidinkieliKoodi()).filter(stringNotEmpty)
                .map(this::findOrCreateKielisyys)
                .ifPresent(yksilointitieto::setAidinkieli);

        yksilointitieto.clearYhteystiedotRyhma();
        Optional.of(yksiloityHenkilo)
                .filter(yHenkilo -> (yHenkilo.getOsoitteet() != null && !yHenkilo.getOsoitteet().isEmpty()) ||
                        !StringUtils.isEmpty(yHenkilo.getSahkoposti()))
                .filter(yHenkilo -> HenkiloTyyppi.OPPIJA.equals(henkilo.getHenkiloTyyppi()))
                .map(yHenkilo -> this.addYhteystiedot(yHenkilo, henkilo.getAsiointiKieli()))
                .ifPresent(yhteystiedotRyhmas -> yhteystiedotRyhmas.forEach(yksilointitieto::addYhteystiedotRyhma));

        yksilointitieto.setHenkilo(henkilo);
        henkilo.setYksilointitieto(yksilointitieto);
        henkilo.setModified(new Date());
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
                        this.isKansalaisuusKoodiValid(Collections.singletonList(kansalaisuusKoodi)))
                .map(this.kansalaisuusRepository::findOrCreate).collect(Collectors.toSet());
    }

    private Kielisyys findOrCreateKielisyys(final String kieliKoodi) {
        return this.kielisyysRepository.findByKieliKoodi(kieliKoodi)
                .orElseGet(() -> this.kielisyysRepository.save(Kielisyys.builder().kieliKoodi(kieliKoodi).build()));
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

        return newYhteystiedot;
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

        // person's existing ssn has changed
        this.updateIfYksiloityValueNotNull(henkilo.getHetu(), yksiloityHenkilo.getHetu(), henkilo::setHetu);

        this.updateIfYksiloityValueNotNull(henkilo.getEtunimet(), yksiloityHenkilo.getEtunimi(),henkilo::setEtunimet);
        this.updateIfYksiloityValueNotNull(henkilo.getSukunimi(), yksiloityHenkilo.getSukunimi(), henkilo::setSukunimi);
        // Sometimes this might null or empty in VTJ data, in that case the original value is kept
        this.updateIfYksiloityValueNotNull(henkilo.getKutsumanimi(), yksiloityHenkilo.getKutsumanimi(), henkilo::setKutsumanimi);

        Optional.ofNullable(yksiloityHenkilo.getAidinkieliKoodi()).filter(stringNotEmpty)
                .ifPresent(kieliKoodi -> henkilo.setAidinkieli(this.findOrCreateKielisyys(kieliKoodi)));

        henkilo.setTurvakielto(yksiloityHenkilo.isTurvakielto());
        henkilo.setSyntymaaika(HetuUtils.dateFromHetu(yksiloityHenkilo.getHetu()));

        //Override VTJ-based address data.
        removeVtjYhteystiedotAndUpdateForOppija(henkilo, yksiloityHenkilo);

        Optional.ofNullable(yksiloityHenkilo.getKansalaisuusKoodit()).filter(collectionNotEmpty)
                .ifPresent(kansalaisuuskoodis -> {
                    henkilo.clearKansalaisuus();
                    this.findOrCreateKansalaisuus(kansalaisuuskoodis).forEach(henkilo::addKansalaisuus);
                });

        henkilo.setSukupuoli(this.maaritaSukupuoli(yksiloityHenkilo));
        henkilo.setModified(new Date());
    }

    private void removeVtjYhteystiedotAndUpdateForOppija(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {
        Iterator<YhteystiedotRyhma> iterator = henkilo.getYhteystiedotRyhma().iterator();
        iterator.forEachRemaining(yhteystiedotRyhmaI -> Optional.ofNullable(yhteystiedotRyhmaI)
                .filter(yhteystiedotRyhma -> yhteystiedotRyhma.getRyhmaAlkuperaTieto().equals(RYHMAALKUPERA_VTJ))
                .ifPresent(yhteystiedotRyhma -> {
                    yhteystiedotRyhma.getYhteystieto().forEach(this.yhteystietoRepository::delete);
                    yhteystiedotRyhma.clearYhteystieto();
                    this.yhteystiedotRyhmaRepository.delete(yhteystiedotRyhmaI);
                    iterator.remove();
                }));
        Optional.of(henkilo.getHenkiloTyyppi()).filter(HenkiloTyyppi.OPPIJA::equals)
                .filter(henkiloTyyppi -> !CollectionUtils.isEmpty(yksiloityHenkilo.getOsoitteet()) ||
                        !StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti()))
                .ifPresent(henkiloTyyppi ->
                        henkilo.addAllYhteystiedotRyhmas(this.addYhteystiedot(yksiloityHenkilo, henkilo.getAsiointiKieli())));
    }

    private boolean isKansalaisuusKoodiValid(List<String> kansalaisuusKoodiList) {
        List<String> koodiTypeList = this.koodistoClient.getKoodiValuesForKoodisto("maatjavaltiot2", 1, true);
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
    @Transactional(readOnly = true)
    public Iterable<String> listPalvelutunnisteet(String oid) {
        Henkilo henkilo = getHenkiloByOid(oid);
        return henkilo.getYksilointiSynkronoinnit().stream()
                .map(YksilointiSynkronointi::getPalvelutunniste)
                .collect(toSet());
    }

    @Override
    @Transactional
    public void enableYksilointi(String oid, String palvelutunniste) {
        Henkilo henkilo = getHenkiloByOid(oid);
        if (henkilo.getYksilointiSynkronoinnit().stream().noneMatch(t -> t.getPalvelutunniste().equals(palvelutunniste))) {
            henkilo.getYksilointiSynkronoinnit().add(new YksilointiSynkronointi(palvelutunniste));
            saveHenkilo(henkilo);
        }
    }

    @Override
    @Transactional
    public void disableYksilointi(String oid, String palvelutunniste) {
        Henkilo henkilo = getHenkiloByOid(oid);
        if (henkilo.getYksilointiSynkronoinnit().removeIf(t -> t.getPalvelutunniste().equals(palvelutunniste))) {
            saveHenkilo(henkilo);
        }
    }

}
