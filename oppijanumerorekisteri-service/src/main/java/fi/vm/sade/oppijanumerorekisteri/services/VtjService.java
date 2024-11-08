package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.TeeHenkilonTunnusKyselyResponse;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.VTJHenkiloVastaussanoma;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.VTJHenkiloVastaussanoma.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.VTJHenkiloVastaussanoma.Henkilo.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.VtjKyselyClient;
import fi.vm.sade.rajapinnat.vtj.api.Huollettava;
import fi.vm.sade.rajapinnat.vtj.api.Huoltaja;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo.EntinenNimiTyyppi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VtjService {
    private final VtjKyselyClient vtjClient;

    public Optional<YksiloityHenkilo> teeHenkiloKysely(String hetu) {
        try {
            return getVtjHenkiloVastaussanoma(hetu, false).map(this::convert);
        } catch (PassivoituException pe) {
            YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
            yksiloityHenkilo.setPassivoitu(true);
            return Optional.of(yksiloityHenkilo);
        }
    }

    public class PassivoituException extends RuntimeException {
    }

    public Optional<VTJHenkiloVastaussanoma> getVtjHenkiloVastaussanoma(String hetu, boolean retried) {
        TeeHenkilonTunnusKyselyResponse tunnusKyselyResult = vtjClient.teeHenkilonTunnusKysely(hetu);
        VTJHenkiloVastaussanoma vastaus = (VTJHenkiloVastaussanoma) tunnusKyselyResult.getTeeHenkilonTunnusKyselyResult().getContent().get(0);
        if (vastaus == null) {
            throw new RuntimeException("Invalid response from VTJ");
        }

        // paluukoodit: https://github.com/Opetushallitus/rajapinnat/blob/8e1faa038a61d67a4e98c4897bc9013aa218f81a/vtj/vtj-remote-api/src/main/resources/wsdl/VTJHenkilotiedotKatalogi.xsd#L608-L643
        String paluuKoodi = vastaus.getPaluukoodi() != null ? vastaus.getPaluukoodi().getKoodi() : "null";
        switch (paluuKoodi) {
            case "0000":
            case "0018":
                return Optional.of(vastaus);
            case "0001":
            case "0006":
                return Optional.empty();
            case "0002":
                // tarkistetaan onko henkilön hetu muuttunut
                String uusiHetu = (vastaus.getHenkilo() != null && vastaus.getHenkilo().getHenkilotunnus() != null) ?
                        vastaus.getHenkilo().getHenkilotunnus().getValue() : null;
                if (uusiHetu != null && !uusiHetu.equals(hetu)) {
                    if(retried) {
                        // todennäköisesti virhe datassa, lopeta rekursio
                        throw new RuntimeException("Query with a new active hetu should not return another new active hetu.");
                    }

                    log.info("Hetu has changed for a person. Making new request to vtjkysely.");
                    // haetaan tiedot uudestaan uudella hetulla
                    return getVtjHenkiloVastaussanoma(uusiHetu, true);
                }
                throw new PassivoituException();
            default:
                log.warn("Unknown response code {} from vtjkysely.", paluuKoodi);
                // taaksepäin yhteensopivuuden vuoksi heitetään NotFoundException
                throw new RuntimeException("Unknown response code '" + paluuKoodi +"'.");
        }
    }

    private YksiloityHenkilo convert(VTJHenkiloVastaussanoma vastaus) {
        YksiloityHenkilo henkilo = new YksiloityHenkilo();
        Henkilo vtjHenkilo = vastaus.getHenkilo();
        assert(vtjHenkilo != null);

        henkilo.setEtunimi(vtjHenkilo.getNykyisetEtunimet().getEtunimet());
        henkilo.setSukunimi(vtjHenkilo.getNykyinenSukunimi().getSukunimi());
        if(!vtjHenkilo.getNykyisetEtunimet().getEtunimet().equals(vtjHenkilo.getNykyinenKutsumanimi().getKutsumanimi())
                && !vtjHenkilo.getNykyinenKutsumanimi().getKutsumanimi().trim().contains(" ")) {
            henkilo.setKutsumanimi(vtjHenkilo.getNykyinenKutsumanimi().getKutsumanimi());
        }
        if (vtjHenkilo.getEntinenNimi() != null) {
            List<YksiloityHenkilo.EntinenNimi> entisetNimet = new ArrayList<>();
            for (Henkilo.EntinenNimi entinenNimi : vtjHenkilo.getEntinenNimi()) {
                EntinenNimiTyyppi tyyppi = EntinenNimiTyyppi.getByKoodi(entinenNimi.getNimilajikoodi());
                entisetNimet.add(new YksiloityHenkilo.EntinenNimi(tyyppi, entinenNimi.getNimi()));
            }
            henkilo.setEntisetNimet(entisetNimet);
        }

        String turvakieltoTieto = vtjHenkilo.getTurvakielto().getTurvakieltoTieto();
        henkilo.setTurvakielto("1".equals(turvakieltoTieto));
        henkilo.setHetu(vtjHenkilo.getHenkilotunnus().getValue());
        henkilo.setSukupuoli(vtjHenkilo.getSukupuoli().getSukupuolikoodi());
        henkilo.setAidinkieliKoodi(KielikoodiKludge.korjaaVirheellinenKoodi(vtjHenkilo.getAidinkieli().getKielikoodi()));

        if (vtjHenkilo.getSahkopostiosoite() != null) {
            henkilo.setSahkoposti(vtjHenkilo.getSahkopostiosoite());
        }

        if (vtjHenkilo.getKansalaisuus() != null) {
            for (Kansalaisuus vtjKansalaisuus : vtjHenkilo.getKansalaisuus()) {
                henkilo.addKansalaisuusKoodi(KansallisuusKludge.korjaaVirheellinenKoodi(vtjKansalaisuus.getKansalaisuuskoodi3()));
            }
        }

        if (vtjHenkilo.getVakinainenKotimainenOsoite() != null) {
            StringBuffer postiOsoiteS = new StringBuffer();
            StringBuffer postiOsoiteR = new StringBuffer();

            String huoneistonumero = StringUtils.trimLeadingCharacter(vtjHenkilo.getVakinainenKotimainenOsoite().getHuoneistonumero(), '0');

            if (vtjHenkilo.getVakinainenKotimainenOsoite().getKatuS() != null) {
                postiOsoiteS.append(vtjHenkilo.getVakinainenKotimainenOsoite().getKatuS());
                postiOsoiteS.append(" ");
                postiOsoiteS.append(vtjHenkilo.getVakinainenKotimainenOsoite().getKatunumero());
                if (vtjHenkilo.getVakinainenKotimainenOsoite().getPorraskirjain() != null) {
                    postiOsoiteS.append(" ");
                    postiOsoiteS.append(vtjHenkilo.getVakinainenKotimainenOsoite().getPorraskirjain());
                }
                if (StringUtils.hasLength(huoneistonumero)) {
                    postiOsoiteS.append(" ");
                    postiOsoiteS.append(huoneistonumero);
                }
                if (vtjHenkilo.getVakinainenKotimainenOsoite().getJakokirjain() != null) {
                    postiOsoiteS.append(" ");
                    postiOsoiteS.append(vtjHenkilo.getVakinainenKotimainenOsoite().getJakokirjain());
                }
            }

            if (vtjHenkilo.getVakinainenKotimainenOsoite().getKatuR() != null) {
                postiOsoiteR.append(vtjHenkilo.getVakinainenKotimainenOsoite().getKatuS());
                postiOsoiteR.append(" ");
                postiOsoiteR.append(vtjHenkilo.getVakinainenKotimainenOsoite().getKatunumero());
                if (vtjHenkilo.getVakinainenKotimainenOsoite().getPorraskirjain() != null) {
                    postiOsoiteR.append(" ");
                    postiOsoiteR.append(vtjHenkilo.getVakinainenKotimainenOsoite().getPorraskirjain());
                }
                if (StringUtils.hasLength(huoneistonumero)) {
                    postiOsoiteR.append(" ");
                    postiOsoiteR.append(huoneistonumero);
                }
                if (vtjHenkilo.getVakinainenKotimainenOsoite().getJakokirjain() != null) {
                    postiOsoiteR.append(" ");
                    postiOsoiteR.append(vtjHenkilo.getVakinainenKotimainenOsoite().getJakokirjain());
                }
            }

            YksiloityHenkilo.OsoiteTieto kotimaanOsoite = new YksiloityHenkilo.OsoiteTieto(
                    "yhteystietotyyppi4",
                    postiOsoiteS.toString().trim(),
                    postiOsoiteR.toString().trim(),
                    vtjHenkilo.getVakinainenKotimainenOsoite().getPostinumero(),
                    vtjHenkilo.getVakinainenKotimainenOsoite().getPostitoimipaikkaS(),
                    vtjHenkilo.getVakinainenKotimainenOsoite().getPostitoimipaikkaR(),
                    "Suomi",
                    "Finland");
            henkilo.addOsoiteTieto(kotimaanOsoite);
        }

        if (vtjHenkilo.getVakinainenUlkomainenOsoite() != null) {
            YksiloityHenkilo.OsoiteTieto ulkomaanOsoite = new YksiloityHenkilo.OsoiteTieto(
                    "yhteystietotyyppi5",
                    vtjHenkilo.getVakinainenUlkomainenOsoite().getUlkomainenLahiosoite(),
                    null,
                    null,
                    vtjHenkilo.getVakinainenUlkomainenOsoite().getUlkomainenPaikkakunta(),
                    null,
                    vtjHenkilo.getVakinainenUlkomainenOsoite().getValtioS(),
                    vtjHenkilo.getVakinainenUlkomainenOsoite().getValtioR());
            henkilo.addOsoiteTieto(ulkomaanOsoite);
        }

        if (vtjHenkilo.getKotikunta() != null) {
            henkilo.setKotikunta(vtjHenkilo.getKotikunta().getKuntanumero());
        }

        if (vtjHenkilo.getHuoltaja() != null) {
            List<Huoltaja> huoltajat = vtjHenkilo.getHuoltaja().stream()
                    .map(vtjHuoltaja -> new Huoltaja(
                            vtjHuoltaja.getNykyisetEtunimet().getEtunimet(),
                            vtjHuoltaja.getNykyinenSukunimi().getSukunimi(),
                            vtjHuoltaja.getHenkilotunnus(),
                            vtjHuoltaja.getHuoltotiedot().getHenkilosuhdelajikoodi()))
                    .filter(huoltaja -> StringUtils.hasLength(huoltaja.getHuoltajuustyyppiKoodi()))
                    .collect(Collectors.toList());
            henkilo.setHuoltajat(huoltajat);
        }

        List<Huollettava> huollettavat = vtjHenkilo.getHuollettava().stream()
            .filter(vtjHuollettava -> StringUtils.hasText(vtjHuollettava.getHenkilotunnus()))
            .map(vtjHuollettava -> new Huollettava(vtjHuollettava.getEtunimet(), vtjHuollettava.getSukunimi(), vtjHuollettava.getHenkilotunnus()))
            .collect(Collectors.toList());
        henkilo.setHuollettavat(huollettavat);

        return henkilo;
    }

    public static class KansallisuusKludge {
        static final String VANHA_SUDAN = "736";
        static final String SUDAN = "729";
        static final String VANHA_ETIOPIA = "230";
        static final String ETIOPIA = "231";

        private static final Map<String, String> VIRHEELLINEN_KORJATTU = Map.of(
                VANHA_SUDAN, SUDAN,
                VANHA_ETIOPIA, ETIOPIA
        );

        /**
         * Vaihtaa (mahdollisen) virheellisen koodin oikeaan.
         *
         * @param kansallisuuskoodi kansallisuuskoodi.
         * @return oikea kansallisuuskoodi; joko annettu tai korjattu, mikäli annettu oli virheellinen.
         */
        public static String korjaaVirheellinenKoodi(String kansallisuuskoodi) {
            return kansallisuuskoodi == null ? null : VIRHEELLINEN_KORJATTU.getOrDefault(kansallisuuskoodi, kansallisuuskoodi);
        }
    }

    public static class KielikoodiKludge {
        static final String HEPREA_VIRHEELLINEN = "iw";
        static final String HEPREA_KORJATTU = "he";

        private static final Map<String,String> VIRHEELLINEN_KORJATTU = new TreeMap<>();
        static {
            VIRHEELLINEN_KORJATTU.put(HEPREA_VIRHEELLINEN, HEPREA_KORJATTU);
        }

        /**
         * Vaihtaa (mahdollisen) virheellisen koodin oikeaan.
         *
         * @param kielikoodi kielikoodi.
         *
         * @return oikea kielikoodi; joko annettu tai korjattu, mikäli annettu oli virheellinen.
         */
        public static String korjaaVirheellinenKoodi(String kielikoodi) {
            return kielikoodi == null ? null : VIRHEELLINEN_KORJATTU.getOrDefault(kielikoodi.toLowerCase(), kielikoodi);
        }
    }
}
