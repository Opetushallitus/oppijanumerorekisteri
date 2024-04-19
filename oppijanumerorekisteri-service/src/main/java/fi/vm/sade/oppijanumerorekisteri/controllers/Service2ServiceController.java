package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.joda.time.DateTime;
import org.springframework.core.env.Environment;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Min;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "Service To Service")
@Validated
@RestController
@RequestMapping("/s2s")
@RequiredArgsConstructor
public class Service2ServiceController {
    private final HenkiloService henkiloService;
    private final HenkiloModificationService henkiloModificationService;

    private final Environment environment;

    @Operation(summary ="Hakee annettua henkilötunnusta vastaavan henkilö OID:n")
    @ApiResponses(value = {@ApiResponse(responseCode = "404", description = "Not Found")})
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/oidByHetu/{hetu}", method = RequestMethod.GET)
    public String oidByHetu(@PathVariable String hetu) {
        return this.henkiloService.getOidByHetu(hetu);
    }

    @Operation(summary ="Hakee annettua eIDAS id:tä vastaavan henkilö OID:n")
    @ApiResponses(value = {@ApiResponse(responseCode = "404", description = "Not Found")})
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @PostMapping(value = "/oidByEidas")
    public String oidByEidasId(@RequestBody OidByEidasRequest body) {
        return this.henkiloService.getOidByEidasId(body.eidasId);
    }

    @Operation(summary = "Hakee henkilöviittaukset oid-listalla ja/tai muokkausaikaleimalla")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ'," +
            "'APP_OPPIJANUMEROREKISTERI_DUPLICATE_READ')")
    @RequestMapping(value = "/duplicateHenkilos", method = RequestMethod.POST)
    public List<HenkiloViiteDto> findDuplicateHenkilos(@RequestBody HenkiloCriteria criteria) {
        return this.henkiloService.findHenkiloViittees(criteria.getHenkiloOids());
    }

    @Operation(summary ="Hakee muuttuneet henkilöt annetusta päivämäärästä aikajärjestyksessä",
            description = "Sivutusta käytettäessä OID:t palautetaan vanhemmasta uudempaan mutta sivun sisäinen järjestys voi muuttua matkalla!")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/changedSince/{at}", method = RequestMethod.GET)
    public List<String> findChangedPersons(@PathVariable DateTime at, @RequestParam(required = false) Integer offset,
                                           @RequestParam(required = false) Integer amount) {
        return this.henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), at, offset, amount);
    }

    @Operation(summary ="Hakee muuttuneet henkilöt annetusta päivämäärästä hakuehdoilla aikajärjestyksessä",
            description = "Sivutusta käytettäessä OID:t palautetaan vanhemmasta uudempaan mutta sivun sisäinen järjestys voi muuttua matkalla!")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/changedSince/{at}", method = RequestMethod.POST)
    public List<String> findChangedPersons(@RequestBody HenkiloCriteria criteria, @PathVariable DateTime at,
                                           @RequestParam(required = false) Integer offset,
                                           @RequestParam(required = false) Integer amount) {
        return this.henkiloService.findHenkiloOidsModifiedSince(criteria, at, offset, amount);
    }

    @Operation(summary ="Hakee tai luo uuden henkilön annetuista henkilön perustiedoista",
                description = "Henkilöllä on neljä erilaista tunnistetietoa: OID, hetu, external id ja identification."
                    + " Jos OID on annettu ja henkilöä ei löydy sillä, palautetaan 404."
                    + " Muussa tapauksessa henkilöä yritetään etsiä muilla tunnistetiedoilla."
                    + " Jos henkilöä ei löydy, luodaan uusi henkilö annetuista tiedoista (ml. kaikki tunnistetiedot).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Henkilö löytyi jollakin annetuista tunnisteista"),
            @ApiResponse(responseCode = "201", description = "Henkilö luotiin annetuista perustiedoista"),
            @ApiResponse(responseCode = "400", description = "Henkilön tiedot virheelliset"),
            @ApiResponse(responseCode = "404", description = "Henkilöä ei löydy annetulla OID:lla"),
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

    @Hidden
    @Operation(summary ="Hakee henkilöiden perustiedot annetuilla hakukriteereillä",
            description = "Korvaava rajapinta: POST /kayttooikeus-service/virkailija/haku")
    @PostMapping("/henkilo/perustiedot")
    @Deprecated // riippuvuus käyttöoikeuspalveluun
    public Iterable<HenkiloHakuDto> list(@Validated @RequestBody HenkiloHakuCriteria criteria,
                                         @RequestParam(required = false) Long offset,
                                         @RequestParam(required = false) Long amount) {
        return henkiloService.list(criteria, offset, amount);
    }

    @Operation(summary ="Hakee henkilöiden perustiedot kunnan ja syntymäajan mukaan",
            description = "Tulosjoukko on sivutettu " + HenkiloServiceImpl.MAX_FETCH_PERSONS + " henkilön kokoisiin paloihin.")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @GetMapping("/henkilo/list/{municipal}/{birthdate}")
    public Slice<HenkiloMunicipalDobDto> findByMunicipalAndBirthdate(
            @Parameter(description = "Koodisto \"kunta\"") @PathVariable("municipal") final String municipal,
            @Parameter(description = "Syntymäaika ISO pvm (YYYY-MM-DD)") @PathVariable("birthdate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate birthdate,
            @Parameter(description = "Tulosjoukon sivutus [1..N)") @RequestParam(defaultValue = "1") @Min(1) final int page) {
        return henkiloService.findByMunicipalAndBirthdate(municipal, birthdate, page);
    }

    @Hidden
    @Operation(summary ="Hakee henkilöiden perustiedot sekä yhteystiedot annetuilla hakukriteereillä",
            description = "Korvaava rajapinta: POST /kayttooikeus-service/virkailija/haku")
    @PostMapping("/henkilo/yhteystiedot")
    @Deprecated // riippuvuus käyttöoikeuspalveluun
    public Iterable<HenkiloYhteystiedotDto> listWithYhteystiedot(@RequestBody HenkiloHakuCriteria criteria) {
        return henkiloService.listWithYhteystiedot(criteria);
    }

    @Operation(summary ="Hakee tai luo uudet henkilöt annetuista henkilöiden perustiedoista")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @RequestMapping(value = "/henkilo/findOrCreateMultiple", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> findOrCreate(@Validated @RequestBody ValidList<HenkiloPerustietoDto> henkilot) {
        return henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(henkilot);
    }

    @Operation(summary ="Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/yhteystiedot/{oid}", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getAllHenkiloYhteystiedot(@PathVariable("oid") String oid) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @Operation(summary ="Hakee henkilöiden perustiedot annetuilla hakukriteereillä")
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
    @Operation(summary ="Palauttaa henkilön tiedot muutostietopalvelua varten")
    public HenkiloForceReadDto getByHetuForMuutostieto(@PathVariable String hetu) {
        return henkiloService.getByHetuForMuutostieto(hetu);
    }
}
