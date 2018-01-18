package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointitietoDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
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
import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
public class YksilointiServiceImpl implements YksilointiService {
    private static final Logger logger = LoggerFactory.getLogger(YksilointiService.class);
    private static final String KIELIKOODI_SV = "sv";

    public static final String RYHMAALKUPERA_VTJ = "alkupera1";
    private static final String RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE = "yhteystietotyyppi8";

    private static final Predicate<String> stringNotEmpty = it -> !StringUtils.isEmpty(it);
    private static final Predicate<Collection> collectionNotEmpty = it -> !CollectionUtils.isEmpty(it);

    private final HenkiloRepository henkiloRepository;
    private final HenkiloService henkiloService;
    private final KansalaisuusRepository kansalaisuusRepository;
    private final KielisyysRepository kielisyysRepository;
    private final YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository;
    private final YhteystietoRepository yhteystietoRepository;
    private final YksilointitietoRepository yksilointitietoRepository;
    private final OrikaConfiguration mapper;

    private final VtjClient vtjClient;
    private final KoodistoClient koodistoClient;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    private Henkilo getHenkiloByOid(String oid) {
        return henkiloRepository.findByOidHenkilo(oid)
                .orElseThrow(() -> new NotFoundException("Henkilo not found by oid " + oid));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<Henkilo> yksiloiAutomaattisesti(final String henkiloOid) {
        try {
            Henkilo henkilo = this.yksiloiManuaalisesti(henkiloOid);
            if (!henkilo.isYksiloityVTJ()) {
                logger.warn("Henkilo {} not identified, data mismatch.", henkilo.getOidHenkilo());
            }
            return Optional.of(henkilo);
        } catch (NotFoundException | HttpConnectionException e) {
            return Optional.empty();
        }
    }

    @Override
    @Transactional
    public Henkilo yksiloiManuaalisesti(final String henkiloOid) {

        Henkilo henkilo = getHenkiloByOid(henkiloOid);

        if (!StringUtils.isEmpty(henkilo.getHetu())) {
            henkilo = yksiloiHenkilo(henkilo);
        }

        // Remove yksilointitieto if henkilo was yksiloity succesfully.
        if (henkilo != null && henkilo.isYksiloityVTJ()) {
            Optional<Yksilointitieto> yksilointitieto = yksilointitietoRepository.findByHenkilo(henkilo);
            if (yksilointitieto.isPresent()) {
                yksilointitietoRepository.delete(yksilointitieto.get());
            }
        }

        return henkilo;

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
        return henkiloService.update(henkilo);
    }

    private @NotNull Henkilo yksiloiHenkilo(@NotNull final Henkilo henkilo) {
        /* VTJ data for Henkilo contains a huge data set and parsing this data
         * might change in the future, if Henkilo's data must contain all what
         * VTJ has to offer but that's still uncertain
         */
        YksiloityHenkilo yksiloityHenkilo = vtjClient.fetchHenkilo(henkilo.getHetu())
                .orElseThrow(() ->
                        new NotFoundException("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: " + henkilo.getHetu()));

        henkilo.setYksilointiYritetty(true);

        NimienYhtenevyys nimienYhtenevyys = tarkistaNimet(henkilo, yksiloityHenkilo);

        if (!nimienYhtenevyys.etunimimatch || !nimienYhtenevyys.sukunimimatch) {
            logger.info("Henkilön tiedot eivät täsmää VTJ-tietoon\n--OID: " + henkilo.getOidHenkilo() + "\n"
                    + "--Annetut etunimet: " + henkilo.getEtunimet() + ", VTJ: " + yksiloityHenkilo.getEtunimi() + "\n"
                    + "--Annettu kutsumanimi: " + henkilo.getKutsumanimi() + ", VTJ: " + yksiloityHenkilo.getKutsumanimi() + "\n"
                    + "--Annettu sukunimi: " + henkilo.getSukunimi() + ", VTJ: " + yksiloityHenkilo.getSukunimi());

            addYksilointitietosWhenNamesDoNotMatch(henkilo, yksiloityHenkilo);
        }
        else {
            logger.info("Henkilön yksilöinti onnistui hetulle: {}", henkilo.getHetu());

            henkilo.setOppijanumero(henkilo.getOidHenkilo());
            // If VTJ data differs from the user's data, VTJ must overwrite
            // those values since VTJ's data is considered more reliable
            paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);

            henkilo.setYksiloityVTJ(true);
            //OPHASPA-1820 kumotaan pärstäyksilöinti
            henkilo.setYksiloity(false);
        }

        return henkiloService.update(henkilo);
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
                        > oppijanumerorekisteriProperties.getEtunimiThreshold()) {
                    etunimiMatch = true;
                    break;
                }
            }
        }

        return new NimienYhtenevyys(etunimiMatch, sukunimiMatch
                >= oppijanumerorekisteriProperties.getSukunimiThreshold());
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

    private Kielisyys findOrCreateKielisyys(final String kieliKoodi) {
        return kielisyysRepository.findByKieliKoodi(kieliKoodi)
                .orElseGet(() -> kielisyysRepository.save(Kielisyys.builder().kieliKoodi(kieliKoodi).build()));
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
        updateIfYksiloityValueNotNull(henkilo.getHetu(), yksiloityHenkilo.getHetu(), henkilo::setHetu);

        updateIfYksiloityValueNotNull(henkilo.getEtunimet(), yksiloityHenkilo.getEtunimi(),henkilo::setEtunimet);
        updateIfYksiloityValueNotNull(henkilo.getSukunimi(), yksiloityHenkilo.getSukunimi(), henkilo::setSukunimi);
        // Sometimes this might null or empty in VTJ data, in that case the original value is kept
        updateIfYksiloityValueNotNull(henkilo.getKutsumanimi(), yksiloityHenkilo.getKutsumanimi(), henkilo::setKutsumanimi);

        Optional.ofNullable(yksiloityHenkilo.getAidinkieliKoodi()).filter(stringNotEmpty)
                .ifPresent(kieliKoodi -> henkilo.setAidinkieli(findOrCreateKielisyys(kieliKoodi)));

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
    }

    private void removeVtjYhteystiedotAndUpdateForOppija(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {
        Iterator<YhteystiedotRyhma> iterator = henkilo.getYhteystiedotRyhma().iterator();
        iterator.forEachRemaining(yhteystiedotRyhmaI -> Optional.ofNullable(yhteystiedotRyhmaI)
                .filter(yhteystiedotRyhma -> yhteystiedotRyhma.getRyhmaAlkuperaTieto().equals(RYHMAALKUPERA_VTJ))
                .ifPresent(yhteystiedotRyhma -> {
                    yhteystiedotRyhma.getYhteystieto().forEach(yhteystietoRepository::delete);
                    yhteystiedotRyhma.clearYhteystieto();
                    yhteystiedotRyhmaRepository.delete(yhteystiedotRyhmaI);
                    iterator.remove();
                }));
        Optional.of(henkilo.getHenkiloTyyppi()).filter(HenkiloTyyppi.OPPIJA::equals)
                .filter(henkiloTyyppi -> !CollectionUtils.isEmpty(yksiloityHenkilo.getOsoitteet()) ||
                        !StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti()))
                .ifPresent(henkiloTyyppi ->
                        henkilo.addAllYhteystiedotRyhmas(addYhteystiedot(yksiloityHenkilo, henkilo.getAsiointiKieli())));
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
        return henkiloService.update(henkilo);
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
        paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);
        henkilo.setVtjsynced(new Date());
        henkiloService.update(henkilo);
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

        if(HenkiloTyyppi.OPPIJA.equals(henkilo.getHenkiloTyyppi()) &&
                (yksilointitieto.getYhteystiedotRyhma() != null && !yksilointitieto.getYhteystiedotRyhma().isEmpty())) {
            henkilo.getYhteystiedotRyhma().addAll(yksilointitieto.getYhteystiedotRyhma());
            yksilointitieto.setYhteystiedotRyhma(new HashSet<>());
        }

        yksilointitietoRepository.delete(yksilointitieto);
        henkiloService.update(henkilo);
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
            henkilo.getYksilointiSynkronoinnit().add(new YksilointiSynkronointi(palvelutunniste, new Date()));
            henkiloService.update(henkilo);
        }
    }

    @Override
    @Transactional
    public void disableYksilointi(String oid, String palvelutunniste) {
        Henkilo henkilo = getHenkiloByOid(oid);
        if (henkilo.getYksilointiSynkronoinnit().removeIf(t -> t.getPalvelutunniste().equals(palvelutunniste))) {
            henkiloService.update(henkilo);
        }
    }

}
