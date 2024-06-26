package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.*;

import java.time.LocalDate;
import java.time.Month;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

import static java.util.Arrays.asList;
import static java.util.Collections.emptySet;

public class DtoUtils {
    public static KielisyysDto createKielisyysDto(String kielikoodi, String kielityyppi) {
        KielisyysDto kielisyysDto = new KielisyysDto();
        kielisyysDto.setKieliKoodi(kielikoodi);
        kielisyysDto.setKieliTyyppi(kielityyppi);
        return kielisyysDto;
    }

    public static KansalaisuusDto createKansalaisuusDto(String kansalaisuuskoodi) {
        KansalaisuusDto kansalaisuusDto = new KansalaisuusDto();
        kansalaisuusDto.setKansalaisuusKoodi(kansalaisuuskoodi);
        return kansalaisuusDto;
    }

    public static HenkiloPerustietoDto createHenkiloPerustietoDto(String etunimet, String kutsumanimi, String sukunimi,
                                                                  String hetu, String henkiloOid, String kielikoodi,
                                                                  String kielityyppi, String kansalaisuusKoodi,
                                                                  List<String> externalIds, List<IdentificationDto> identifications,
                                                                  LocalDate syntymaaika, Date modified) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuusDto = DtoUtils.createKansalaisuusDto(kansalaisuusKoodi);
        return new HenkiloPerustietoDto(henkiloOid, externalIds, identifications, hetu, etunimet, kutsumanimi, sukunimi, syntymaaika, false, aidinkieli, asiointikieli,
                Collections.singleton(kansalaisuusDto), "1", modified);
    }

    public static HenkiloOidHetuNimiDto createHenkiloOidHetuNimiDto(String etunimet, String kutsumanimi, String sukunimi,
                                                             String hetu, String oidHenkilo) {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = new HenkiloOidHetuNimiDto();
        henkiloOidHetuNimiDto.setEtunimet(etunimet);
        henkiloOidHetuNimiDto.setKutsumanimi(kutsumanimi);
        henkiloOidHetuNimiDto.setSukunimi(sukunimi);
        henkiloOidHetuNimiDto.setHetu(hetu);
        henkiloOidHetuNimiDto.setOidHenkilo(oidHenkilo);
        return henkiloOidHetuNimiDto;
    }

    public static HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, String kasittelija, String yhteystietoArvo) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto();
        kansalaisuus.setKansalaisuusKoodi(kansalaisuuskoodi);
        LocalDate syntymaAika = LocalDate.of(1970, Month.OCTOBER, 10);

        Date createdModified = new Date(29364800000L);
        YhteystiedotRyhmaDto yhteystiedotRyhmaDto = createYhteystiedotRyhmaDto(yhteystietoArvo);

        return new HenkiloDto(oidHenkilo, hetu, null, passivoitu, etunimet, kutsumanimi, sukunimi,
                aidinkieli, aidinkieli, Collections.singleton(kansalaisuus), kasittelija,
                syntymaAika, "1", null, "1.2.3.4.5", null, false, false, false, false, false, createdModified,
                createdModified, null, Collections.singleton(yhteystiedotRyhmaDto), new HashSet<>(), null);
    }

    public static HenkiloCreateDto createHenkiloCreateDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, String yhteystietoArvo) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto();
        kansalaisuus.setKansalaisuusKoodi(kansalaisuuskoodi);
        LocalDate syntymaAika = LocalDate.of(1970, 10, 14);

        YhteystiedotRyhmaDto yhteystiedotRyhmaDto = createYhteystiedotRyhmaDto(yhteystietoArvo);

        return new HenkiloCreateDto(hetu, passivoitu, etunimet, kutsumanimi, sukunimi, aidinkieli,
                aidinkieli, Collections.singleton(kansalaisuus), syntymaAika, "1",
                null, "1.2.3.4.5", null, false, false,
                false, false, false, null, Collections.singleton(yhteystiedotRyhmaDto), emptySet());
    }

    public static HenkiloUpdateDto createHenkiloUpdateDto(String etunimet, String kutsumanimi, String sukunimi, String hetu,
                                                          String oidHenkilo, String kielikoodi, String kielityyppi,
                                                          String kansalaisuuskoodi, String yhteystietoArvo) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuus = DtoUtils.createKansalaisuusDto(kansalaisuuskoodi);
        YhteystiedotRyhmaDto yhteystiedotRyhma = DtoUtils.createYhteystiedotRyhmaDto(yhteystietoArvo);
        LocalDate syntymaAika = LocalDate.of(1970, Month.OCTOBER, 10);

        return new HenkiloUpdateDto(oidHenkilo, null, etunimet, kutsumanimi, sukunimi, hetu,
                syntymaAika, null, "1", null, asiointikieli, aidinkieli,
                Collections.singleton(kansalaisuus), new HashSet<>(asList(yhteystiedotRyhma)));
    }

    public static YhteystiedotRyhmaDto createYhteystiedotRyhmaDto(String yhteystietoArvo) {
        YhteystietoDto yhteystieto = DtoUtils.createYhteystietoDto(yhteystietoArvo);
        return new YhteystiedotRyhmaDto(1L, "yhteystietotyyppi7", "alkupera2",
                true, Collections.singleton(yhteystieto));
    }

    public static YhteystietoDto createYhteystietoDto(String yhteystietoArvo) {
        return new YhteystietoDto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo);
    }
}
