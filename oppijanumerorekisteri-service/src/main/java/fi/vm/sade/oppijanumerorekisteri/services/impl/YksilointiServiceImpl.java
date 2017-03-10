package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
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
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class YksilointiServiceImpl implements YksilointiService {
    private static final Logger logger = LoggerFactory.getLogger(YksilointiService.class);

    private final YksilointitietoRepository yksilointitietoRepository;
    private final HenkiloRepository henkiloRepository;
    private final KansalaisuusRepository kansalaisuusRepository;
    private final KielisyysRepository kielisyysRepository;
    private final YhteystietoRepository yhteystietoRepository;
    private final YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository;

    private final VtjClient vtjClient;
    private final KoodistoClient koodistoClient;

    private final OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    public static final String RYHMAALKUPERA_VTJ = "alkupera1";
    private static final String RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE = "yhteystietotyyppi8";

    @Autowired
    public YksilointiServiceImpl(HenkiloRepository henkiloRepository,
                                 YksilointitietoRepository yksilointitietoRepository,
                                 VtjClient vtjClient,
                                 KoodistoClient koodistoClient,
                                 OppijanumerorekisteriProperties oppijanumerorekisteriProperties,
                                 KansalaisuusRepository kansalaisuusRepository,
                                 KielisyysRepository kielisyysRepository,
                                 YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository,
                                 YhteystietoRepository yhteystietoRepository) {
        this.henkiloRepository = henkiloRepository;
        this.yksilointitietoRepository = yksilointitietoRepository;
        this.vtjClient = vtjClient;
        this.oppijanumerorekisteriProperties = oppijanumerorekisteriProperties;
        this.kansalaisuusRepository = kansalaisuusRepository;
        this.kielisyysRepository = kielisyysRepository;
        this.koodistoClient = koodistoClient;
        this.yhteystiedotRyhmaRepository = yhteystiedotRyhmaRepository;
        this.yhteystietoRepository = yhteystietoRepository;
    }


    @Override
    @Transactional
    public Henkilo yksiloiManuaalisesti(final String henkiloOid) {
        Henkilo henkilo = this.henkiloRepository.findByOidHenkilo(henkiloOid)
                .orElseThrow(() -> new NotFoundException("Henkilo not found by oid " + henkiloOid));
        String hetu = henkilo.getHetu();

        if (hetu != null) {
            henkilo = yksiloiHenkilo(henkilo);
        }


        if (henkilo != null && henkilo.isYksiloityVTJ() && henkilo.getYksilointitieto() != null) {
            this.yksilointitietoRepository.delete(henkilo.getYksilointitieto());
            henkilo.setYksilointitieto(null);
            henkilo.setModified(new Date());
        }

        return henkilo;
    }

    private Henkilo yksiloiHenkilo(@NotNull Henkilo henkilo) {
        /* VTJ data for Henkilo contains a huge data set and parsing this data
         * might change in the future, if Henkilo's data must contain all what
         * VTJ has to offer but that's still uncertain
         */
        YksiloityHenkilo yksiloityHenkilo = this.vtjClient.fetchHenkilo(henkilo.getHetu());

        henkilo.setYksilointiYritetty(true);

        if (yksiloityHenkilo == null) {
            throw new NotFoundException("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: " + henkilo.getHetu());
        }
        // Henkilo model must be refresh to avoid StaleObjectException
//        henkilo = henkiloDAO.findByOid(henkiloOid);

        NimienYhtenevyys nimienYhtenevyys = tarkistaNimet(henkilo, yksiloityHenkilo);

        if (!nimienYhtenevyys.etunimimatch || !nimienYhtenevyys.sukunimimatch) {
            this.addYksilointitietosWhenNamesDoNotMatch(henkilo, yksiloityHenkilo);
        }
        else {
            logger.info("Henkilön yksilöinti onnistui hetulle: {}", henkilo.getHetu());

            henkilo.setOppijanumero(henkilo.getOidHenkilo());
            // If VTJ data differs from the user's data, VTJ must overwrite
            // those values since VTJ's data is considered more reliable
            henkilo = this.paivitaHenkilonTiedotVTJnTiedoilla(henkilo, yksiloityHenkilo);

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

    private void addYksilointitietosWhenNamesDoNotMatch(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {
        Yksilointitieto yksilointitieto;

        if (henkilo.getYksilointitieto() == null) {
            yksilointitieto = new Yksilointitieto();
        }
        else {
            yksilointitieto = henkilo.getYksilointitieto();
        }

        logger.info("Henkilön tiedot eivät täsmää VTJ-tietoon\n--OID: " + henkilo.getOidHenkilo() + "\n"
                + "--Annetut etunimet: " + henkilo.getEtunimet() + ", VTJ: " + yksiloityHenkilo.getEtunimi() + "\n"
                + "--Annettu kutsumanimi: " + henkilo.getKutsumanimi() + ", VTJ: " + yksiloityHenkilo.getKutsumanimi() + "\n"
                + "--Annettu sukunimi: " + henkilo.getSukunimi() + ", VTJ: " + yksiloityHenkilo.getSukunimi());

        yksilointitieto.setEtunimet(yksiloityHenkilo.getEtunimi());
        yksilointitieto.setKutsumanimi(yksiloityHenkilo.getKutsumanimi());
        yksilointitieto.setSukunimi(yksiloityHenkilo.getSukunimi());

        yksilointitieto.setSukupuoli(maaritaSukupuoli(yksiloityHenkilo));

        if (!CollectionUtils.isEmpty(yksiloityHenkilo.getKansalaisuusKoodit())) {
            for (Kansalaisuus k : this.findOrCreateKansalaisuus(yksiloityHenkilo.getKansalaisuusKoodit())) {
                yksilointitieto.addKansalaisuus(k);
            }
        }

        if (!StringUtils.isEmpty(yksiloityHenkilo.getAidinkieliKoodi())) {
            yksilointitieto.setAidinkieli(this.findOrCreateKielisyys(yksiloityHenkilo.getAidinkieliKoodi()));
        }

        if ((yksiloityHenkilo.getOsoitteet() != null && !yksiloityHenkilo.getOsoitteet().isEmpty()) ||
                !StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti())) {
            if (yksilointitieto.getYhteystiedotRyhma() != null &&
                    !yksilointitieto.getYhteystiedotRyhma().isEmpty()) {
                yksilointitieto.getYhteystiedotRyhma().clear();
            }

            if(HenkiloTyyppi.OPPIJA.equals(henkilo.getHenkiloTyyppi())) {
                for (YhteystiedotRyhma ytRyhma : this.addYhteystiedot(yksiloityHenkilo, henkilo.getAsiointiKieli())) {
                    yksilointitieto.addYhteystiedotRyhma(ytRyhma);
                }
            }
        }
        yksilointitieto.setTurvakielto(yksiloityHenkilo.isTurvakielto());
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

    // TODO löytynee jo jostain
    public Set<Kansalaisuus> findOrCreateKansalaisuus(List<String> kansalaisuusKoodit) {
        Set<Kansalaisuus> kansalaisuudet = new HashSet<>();
        for (String kKoodi : kansalaisuusKoodit) {
            if(this.isKansalaisuusKoodiValid(Collections.singletonList(kKoodi))) {
                kansalaisuudet.add(this.kansalaisuusRepository.findOrCreate(kKoodi));
            }
        }
        return kansalaisuudet;
    }

    // TODO löytynee jo jostain
    public Kielisyys findOrCreateKielisyys(String kieliKoodi) {
        Optional<Kielisyys> kielisyys;
        kielisyys = this.kielisyysRepository.findByKieliKoodi(kieliKoodi);
        if(!kielisyys.isPresent()) {
            Kielisyys newKielisyys = new Kielisyys();
            newKielisyys.setKieliKoodi(kieliKoodi);
            kielisyys = Optional.of(this.kielisyysRepository.save(newKielisyys));
        }
        return kielisyys.get();
    }

    public Set<YhteystiedotRyhma> addYhteystiedot(YksiloityHenkilo yksiloityHenkilo, Kielisyys asiointiKieli) {
        Set<YhteystiedotRyhma> newYhteystiedot = new HashSet<YhteystiedotRyhma>();

        if (yksiloityHenkilo.getOsoitteet() != null && !yksiloityHenkilo.getOsoitteet().isEmpty()) {
            for (YksiloityHenkilo.OsoiteTieto ot : yksiloityHenkilo.getOsoitteet()) {
                YhteystiedotRyhma ytRyhma = new YhteystiedotRyhma();
                ytRyhma.setReadOnly(true);
                ytRyhma.setRyhmaKuvaus(ot.getTyyppi());
                ytRyhma.setRyhmaAlkuperaTieto(RYHMAALKUPERA_VTJ);

                Yhteystieto ytKatu = new Yhteystieto();
                ytKatu.setYhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE);
                if ( (asiointiKieli != null && asiointiKieli.getKieliKoodi().equals("sv") &&
                        !StringUtils.isEmpty(ot.getKatuosoiteR())) || StringUtils.isEmpty(ot.getKatuosoiteS()) ) {
                    ytKatu.setYhteystietoArvo(ot.getKatuosoiteR());
                }
                else {
                    ytKatu.setYhteystietoArvo(ot.getKatuosoiteS());
                }
                ytRyhma.addYhteystieto(ytKatu);

                if (ot.getPostinumero() != null) {
                    Yhteystieto ytNro = new Yhteystieto();
                    ytNro.setYhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO);
                    ytNro.setYhteystietoArvo(ot.getPostinumero());
                    ytRyhma.addYhteystieto(ytNro);
                }

                Yhteystieto ytCity = new Yhteystieto();
                ytCity.setYhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI);
                if ( (asiointiKieli != null && asiointiKieli.getKieliKoodi().equals("sv") &&
                        !StringUtils.isEmpty(ot.getKaupunkiR())) || StringUtils.isEmpty(ot.getKaupunkiS()) ) {
                    ytCity.setYhteystietoArvo(ot.getKaupunkiR());
                }
                else {
                    ytCity.setYhteystietoArvo(ot.getKaupunkiS());
                }
                ytRyhma.addYhteystieto(ytCity);

                Yhteystieto ytMaa = new Yhteystieto();
                ytMaa.setYhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_MAA);
                if ( (asiointiKieli != null && asiointiKieli.getKieliKoodi().equals("sv") &&
                        !StringUtils.isEmpty(ot.getMaaR())) || StringUtils.isEmpty(ot.getMaaS()) ) {
                    ytMaa.setYhteystietoArvo(ot.getMaaR());
                }
                else {
                    ytMaa.setYhteystietoArvo(ot.getMaaS());
                }
                ytRyhma.addYhteystieto(ytMaa);

                newYhteystiedot.add(ytRyhma);
            }
        }
        if (!StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti())) {
            YhteystiedotRyhma sahkYhtTieto = new YhteystiedotRyhma();
            sahkYhtTieto.setReadOnly(true);
            sahkYhtTieto.setRyhmaKuvaus(RYHMAKUVAUS_VTJ_SAHKOINEN_OSOITE);
            sahkYhtTieto.setRyhmaAlkuperaTieto(RYHMAALKUPERA_VTJ);

            Yhteystieto yt = new Yhteystieto();
            yt.setYhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI);
            yt.setYhteystietoArvo(yksiloityHenkilo.getSahkoposti());
            sahkYhtTieto.addYhteystieto(yt);

            newYhteystiedot.add(sahkYhtTieto);
        }

        return newYhteystiedot;
    }

    private Henkilo paivitaHenkilonTiedotVTJnTiedoilla(Henkilo henkilo, YksiloityHenkilo yksiloityHenkilo) {

        henkilo.setOppijanumero(henkilo.getOidHenkilo());


        if (henkilo.getHetu() != null && !henkilo.getHetu().equals(yksiloityHenkilo.getHetu())) {
            // person's existing ssn has changed
            henkilo.setHetu(yksiloityHenkilo.getHetu());
        }

        if (!henkilo.getEtunimet().equals(yksiloityHenkilo.getEtunimi())) {
            henkilo.setEtunimet(yksiloityHenkilo.getEtunimi());
        }
        if (!henkilo.getSukunimi().equals(yksiloityHenkilo.getSukunimi())) {
            henkilo.setSukunimi(yksiloityHenkilo.getSukunimi());
        }
        // Sometimes this might null or empty in VTJ data, in that case the original value is kept
        if (!StringUtils.isEmpty(yksiloityHenkilo.getKutsumanimi()) &&
                !henkilo.getKutsumanimi().equals(yksiloityHenkilo.getKutsumanimi())) {
            henkilo.setKutsumanimi(yksiloityHenkilo.getKutsumanimi());
        }

        if (!StringUtils.isEmpty(yksiloityHenkilo.getAidinkieliKoodi())) {
            henkilo.setAidinkieli(this.findOrCreateKielisyys(yksiloityHenkilo.getAidinkieliKoodi()));
        }

        henkilo.setTurvakielto(yksiloityHenkilo.isTurvakielto());
        try {
            henkilo.setSyntymaaika(HetuUtils.dateFromHetu(yksiloityHenkilo.getHetu()));
        } catch (DateTimeParseException e) {
            throw new ValidationException("security.number.format.illegal");
        }

        //Override VTJ-based address data.
        Iterator<YhteystiedotRyhma> iterator = henkilo.getYhteystiedotRyhma().iterator();
        while (iterator.hasNext()) {
            YhteystiedotRyhma yr = iterator.next();

            if (yr.getRyhmaAlkuperaTieto().matches(RYHMAALKUPERA_VTJ)) {
                for (Yhteystieto yhs : yr.getYhteystieto()) {
                    this.yhteystietoRepository.delete(yhs);
                }
                yr.clearYhteystieto();
                this.yhteystiedotRyhmaRepository.delete(yr);
                iterator.remove();
            }
        }

        if(HenkiloTyyppi.OPPIJA.equals(henkilo.getHenkiloTyyppi())) {
            if (!CollectionUtils.isEmpty(yksiloityHenkilo.getOsoitteet()) ||
                    !StringUtils.isEmpty(yksiloityHenkilo.getSahkoposti())) {
                henkilo.addAllYhteystiedotRyhmas(this.addYhteystiedot(yksiloityHenkilo, henkilo.getAsiointiKieli()));
            }
        }

        if (yksiloityHenkilo.getKansalaisuusKoodit() != null &&
                !yksiloityHenkilo.getKansalaisuusKoodit().isEmpty()) {
            henkilo.clearKansalaisuus();
            for (Kansalaisuus k : this.findOrCreateKansalaisuus(yksiloityHenkilo.getKansalaisuusKoodit())) {
                henkilo.addKansalaisuus(k);
            }
        }

        henkilo.setSukupuoli(maaritaSukupuoli(yksiloityHenkilo));
        henkilo.setModified(new Date());

        return henkilo;
    }

    public boolean isKansalaisuusKoodiValid(List<String> kansalaisuusKoodiList) {
        List<String> koodiTypeList = this.koodistoClient.getKoodiValuesForKoodisto("maatjavaltiot2", 1, true);
        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        return !(kansalaisuusKoodiList != null && !kansalaisuusKoodiList.stream()
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.equals(kansalaisuus))));
    }

}
