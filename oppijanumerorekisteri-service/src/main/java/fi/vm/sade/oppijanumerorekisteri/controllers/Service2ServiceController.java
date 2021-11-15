package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import io.swagger.annotations.*;
import lombok.RequiredArgsConstructor;
import org.joda.time.DateTime;
import org.springframework.core.env.Environment;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.Min;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@Api(tags = "Service To Service")
@Validated
@RestController
@RequestMapping("/s2s")
@RequiredArgsConstructor
public class Service2ServiceController {
    private final HenkiloService henkiloService;
    private final HenkiloModificationService henkiloModificationService;

    private final Environment environment;

    @ApiOperation("Hakee annettua henkilötunnusta vastaavan henkilö OID:n")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/oidByHetu/{hetu}", method = RequestMethod.GET)
    public String oidByHetu(@PathVariable String hetu) {
        return this.henkiloService.getOidByHetu(hetu);
    }

    @ApiOperation(value = "Hakee hetu & oid -yhdistelmät")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/hetusAndOids", method = RequestMethod.GET)
    public List<HenkiloHetuAndOidDto> hetusAndOidsOrderedByLastVtjSyncTimestamp(
            @ApiParam(value = "Hakee vain ne identiteetit, jotka on päivitetty VTJ:stä ennen annettua ajanhetkeä")
            @RequestParam(value = "syncedBeforeTimestamp", required = false)
                    Long syncedBeforeTimestamp,
            @RequestParam(value = "offset", required = false, defaultValue = "0")
                    long offset,
            @RequestParam(value = "limit", required = false, defaultValue = "100")
                    long limit) {
        return this.henkiloService.getHetusAndOids(syncedBeforeTimestamp, offset, limit);
    }

    @ApiOperation(value = "Hakee henkilöviittaukset oid-listalla ja/tai muokkausaikaleimalla")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ'," +
            "'APP_OPPIJANUMEROREKISTERI_DUPLICATE_READ')")
    @RequestMapping(value = "/duplicateHenkilos", method = RequestMethod.POST)
    public List<HenkiloViiteDto> findDuplicateHenkilos(@RequestBody HenkiloCriteria criteria) {
        return this.henkiloService.findHenkiloViittees(criteria);
    }

    @ApiOperation(value = "Hakee muuttuneet henkilöt annetusta päivämäärästä aikajärjestyksessä",
            notes = "Sivutusta käytettäessä OID:t palautetaan vanhemmasta uudempaan mutta sivun sisäinen järjestys voi muuttua matkalla!")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/changedSince/{at}", method = RequestMethod.GET)
    public List<String> findChangedPersons(@PathVariable DateTime at, @RequestParam(required = false) Integer offset,
                                           @RequestParam(required = false) Integer amount) {
        return this.henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), at, offset, amount);
    }

    @ApiOperation(value = "Hakee muuttuneet henkilöt annetusta päivämäärästä hakuehdoilla aikajärjestyksessä",
            notes = "Sivutusta käytettäessä OID:t palautetaan vanhemmasta uudempaan mutta sivun sisäinen järjestys voi muuttua matkalla!")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/changedSince/{at}", method = RequestMethod.POST)
    public List<String> findChangedPersons(@RequestBody HenkiloCriteria criteria, @PathVariable DateTime at,
                                           @RequestParam(required = false) Integer offset,
                                           @RequestParam(required = false) Integer amount) {
        return this.henkiloService.findHenkiloOidsModifiedSince(criteria, at, offset, amount);
    }

    @ApiOperation(value = "Hakee tai luo uuden henkilön annetuista henkilön perustiedoista",
            notes = "Henkilöllä on neljä erilaista tunnistetietoa: OID, hetu, external id ja identification."
                    + " Jos OID on annettu ja henkilöä ei löydy sillä, palautetaan 404."
                    + " Muussa tapauksessa henkilöä yritetään etsiä muilla tunnistetiedoilla."
                    + " Jos henkilöä ei löydy, luodaan uusi henkilö annetuista tiedoista (ml. kaikki tunnistetiedot).")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Henkilö löytyi jollakin annetuista tunnisteista"),
            @ApiResponse(code = 201, message = "Henkilö luotiin annetuista perustiedoista"),
            @ApiResponse(code = 400, message = "Henkilön tiedot virheelliset"),
            @ApiResponse(code = 404, message = "Henkilöä ei löydy annetulla OID:lla"),
    })
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @RequestMapping(value = "/findOrCreateHenkiloPerustieto", method = RequestMethod.POST)
    public ResponseEntity<HenkiloPerustietoDto> createNewHenkilo(@Validated @RequestBody HenkiloPerustietoDto henkiloPerustietoDto) {
        FindOrCreateWrapper<HenkiloPerustietoDto> wrapper = this.henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDto);
        HenkiloPerustietoDto returnDto = wrapper.getDto();
        if (wrapper.isCreated()) {
            return ResponseEntity.created(URI.create(this.environment.getProperty("server.contextPath") + "/henkilo/"
                    + returnDto.getOidHenkilo())).body(returnDto);
        } else {
            return ResponseEntity.ok(returnDto);
        }
    }

    @ApiOperation(value = "Hakee henkilöiden perustiedot annetuilla hakukriteereillä",
            notes = "Korvaava rajapinta: POST /kayttooikeus-service/virkailija/haku")
    @PostMapping("/henkilo/perustiedot")
    @Deprecated // riippuvuus käyttöoikeuspalveluun
    public Iterable<HenkiloHakuDto> list(@Validated @RequestBody HenkiloHakuCriteria criteria,
                                         @RequestParam(required = false) Long offset,
                                         @RequestParam(required = false) Long amount) {
        return henkiloService.list(criteria, offset, amount);
    }

    @ApiOperation(value = "Hakee henkilöiden perustiedot kunnan ja syntymäajan mukaan",
            notes="Tulosjoukko on sivutettu " + HenkiloServiceImpl.MAX_FETCH_PERSONS + " henkilön kokoisiin paloihin.")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @GetMapping("/henkilo/list/{municipal}/{birthdate}")
    public Slice<HenkiloMunicipalDobDto> findByMunicipalAndBirthdate(
            @ApiParam("Koodisto \"kunta\"") @PathVariable("municipal") final String municipal,
            @ApiParam("Syntymäaika ISO pvm (YYYY-MM-DD)") @PathVariable("birthdate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate birthdate,
            @ApiParam(value = "Tulosjoukon sivutus [1..N)") @RequestParam(defaultValue = "1") @Min(1) final int page) {
        return henkiloService.findByMunicipalAndBirthdate(municipal, birthdate, page);
    }

    @ApiOperation(value = "Hakee henkilöiden perustiedot sekä yhteystiedot annetuilla hakukriteereillä",
            notes = "Korvaava rajapinta: POST /kayttooikeus-service/virkailija/haku")
    @PostMapping("/henkilo/yhteystiedot")
    @Deprecated // riippuvuus käyttöoikeuspalveluun
    public Iterable<HenkiloYhteystiedotDto> listWithYhteystiedot(@RequestBody HenkiloHakuCriteria criteria) {
        return henkiloService.listWithYhteystiedot(criteria);
    }

    @ApiOperation(value = "Hakee tai luo uudet henkilöt annetuista henkilöiden perustiedoista")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @RequestMapping(value = "/henkilo/findOrCreateMultiple", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> findOrCreate(@Validated @RequestBody ValidList<HenkiloPerustietoDto> henkilot) {
        return henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(henkilot);
    }

    @ApiOperation("Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/yhteystiedot/{oid}", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getAllHenkiloYhteystiedot(@PathVariable("oid") String oid) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @ApiOperation("Hakee henkilöiden perustiedot annetuilla hakukriteereillä")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @PostMapping("/henkilo/perustiedotAsAdmin")
    public Iterable<HenkiloHakuPerustietoDto> listAsAdmin(@RequestParam(required = false) Long offset,
                                                          @RequestParam(required = false) Long limit,
                                                          @Validated @RequestBody HenkiloHakuCriteriaDto criteria) {
        return this.henkiloService.list(criteria, offset, limit);
    }

    @GetMapping("/henkilo/hetu={hetu}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_MUUTOSTIETOPALVELU')")
    @ApiOperation("Palauttaa henkilön tiedot muutostietopalvelua varten")
    public HenkiloForceReadDto getByHetuForMuutostieto(@PathVariable String hetu) {
        return henkiloService.getByHetuForMuutostieto(hetu);
    }

    @ApiOperation(value = "Päivittää henkilön tietoja muutostietopalvelun antamilla muutoksilla.",
            notes = "Päivittää kutsussa annettuun OID:n täsmäävän henkilön tiedot")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_MUUTOSTIETOPALVELU')")
    @RequestMapping(value = "/henkilo/muutostiedot", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public HenkiloForceReadDto forceUpdateHenkilo(@Validated @RequestBody HenkiloForceUpdateDto henkiloUpdateDto) {
        return this.henkiloModificationService.forceUpdateHenkilo(henkiloUpdateDto);
    }
}
