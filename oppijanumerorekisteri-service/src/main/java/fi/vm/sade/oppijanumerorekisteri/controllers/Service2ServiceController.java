package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuCriteria;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHetuAndOidDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import io.swagger.annotations.*;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Api(tags = "Service To Service")
@RestController
@RequestMapping("/s2s")
public class Service2ServiceController {
    private HenkiloService henkiloService;

    private Environment environment;

    @Autowired
    public Service2ServiceController(HenkiloService henkiloService, Environment environment) {
        this.henkiloService = henkiloService;
        this.environment = environment;
    }

    @ApiOperation("Hakee annettua henkilötunnusta vastaavan henkilö OID:n")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/oidByHetu/{hetu}", method = RequestMethod.GET)
    public String oidByHetu(@PathVariable String hetu) {
        return this.henkiloService.getOidByHetu(hetu);
    }

    @ApiOperation(value = "Hakee hetu & oid -yhdistelmät")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
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
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/duplicateHenkilos", method = RequestMethod.POST) 
    public List<HenkiloViiteDto> findDuplicateHenkilos(@RequestBody HenkiloCriteria criteria) {
        return this.henkiloService.findHenkiloViittees(criteria);
    }

    @ApiOperation(value = "Hakee muuttuneet henkilöt annetusta päivämäärästä aikajärjestyksessä",
            notes = "Sivutusta käytettäessä OID:t palautetaan vanhemmasta uudempaan mutta sivun sisäinen järjestys voi muuttua matkalla!")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/changedSince/{at}", method = RequestMethod.GET)
    public List<String> findChangedPersons(@PathVariable DateTime at, @RequestParam(required = false) Integer offset,
                                           @RequestParam(required = false) Integer amount) {
        return this.henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), at, offset, amount);
    }

    @ApiOperation(value = "Hakee muuttuneet henkilöt annetusta päivämäärästä hakuehdoilla aikajärjestyksessä",
            notes = "Sivutusta käytettäessä OID:t palautetaan vanhemmasta uudempaan mutta sivun sisäinen järjestys voi muuttua matkalla!")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
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
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/findOrCreateHenkiloPerustieto", method = RequestMethod.POST)
    public ResponseEntity<HenkiloPerustietoDto> createNewHenkilo(@Validated @RequestBody HenkiloPerustietoDto henkiloPerustietoDto) {
        FindOrCreateWrapper<HenkiloPerustietoDto> wrapper = this.henkiloService.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDto);
        HenkiloPerustietoDto returnDto = wrapper.getDto();
        if (wrapper.isCreated()) {
            return ResponseEntity.created(URI.create(this.environment.getProperty("server.contextPath") + "/henkilo/"
                    + returnDto.getOidHenkilo())).body(returnDto);
        }
        else {
            return ResponseEntity.ok(returnDto);
        }
    }

    @ApiOperation("Hakee henkilöiden perustiedot annetuilla hakukriteereillä")
    @PostMapping("/henkilo/perustiedot")
    public Iterable<HenkiloHakuDto> list(@RequestBody HenkiloHakuCriteria criteria) {
        return henkiloService.list(criteria);
    }

    @ApiOperation(value = "Hakee tai luo uudet henkilöt annetuista henkilöiden perustiedoista")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkilo/findOrCreateMultiple", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> findOrCreate(@Validated @RequestBody List<HenkiloPerustietoDto> henkilot) {
        return henkiloService.findOrCreateHenkiloFromPerustietoDto(henkilot);
    }

    @ApiOperation("Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/yhteystiedot/{oid}", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getAllHenkiloYhteystiedot(@PathVariable("oid") String oid) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

}
