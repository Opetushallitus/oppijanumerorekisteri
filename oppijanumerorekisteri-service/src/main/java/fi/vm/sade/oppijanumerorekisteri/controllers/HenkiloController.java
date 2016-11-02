package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import io.swagger.annotations.*;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "Henkilot")
@RestController
@RequestMapping("/henkilo")
public class HenkiloController {
    private HenkiloService henkiloService;

    public HenkiloController(HenkiloService henkiloService) {
        this.henkiloService = henkiloService;
    }

    @ApiOperation("Palauttaa tiedon, onko kirjautuneella käyttäjällä henkilötunnus järjestelmässä")
    @RequestMapping(value = "/current/hasHetu", method = RequestMethod.GET)
    public Boolean hasHetu() {
        // get oid from security context
        return henkiloService.getHasHetu();
    }

    @ApiOperation("Hakee henkilöiden OID:n, HeTu:n ja nimet nimen perusteella")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerusByName", method = RequestMethod.GET)
    public List<HenkiloOidHetuNimiDto> henkiloOidHetuNimisByName(@RequestParam(value = "etunimet") String etunimet,
                                                                @RequestParam(value = "sukunimi") String sukunimi) {
        return this.henkiloService.getHenkiloOidHetuNimiByName(etunimet, sukunimi);
    }

    @ApiOperation(value = "Hakee henkilön OID:n, HeTu:n ja nimet henkilötunnuksen perusteella")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerusByHetu/{hetu}", method = RequestMethod.GET)
    public HenkiloOidHetuNimiDto henkiloOidHetuNimiByHetu(@PathVariable String hetu) {
        return this.henkiloService.getHenkiloOidHetuNimiByHetu(hetu);
    }

    @ApiOperation("Hakee annetun henkilö OID listaa vastaavien henkilöiden perustiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerustietosByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(@RequestBody List<String> henkiloOids) {
        return this.henkiloService.getHenkiloPerustietoByOids(henkiloOids);
    }

    @ApiOperation(value = "Luo uuden henkilön annetuista henkilon perustiedoista")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "Validation exception")})
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/createHenkilo", method = RequestMethod.POST)
    public HenkiloPerustietoDto createNewHenkilo(@Validated @RequestBody HenkiloPerustietoDto henkiloPerustietoDto) {
        return this.henkiloService.createHenkiloFromPerustietoDto(henkiloPerustietoDto);
    }

    @ApiOperation("Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    // TODO: use proper organization related checks when implemented, used to be:
    // @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(
            @ApiParam("Henkilön OID") @PathVariable("oid") String oid
            /** Used to be: @P("permissionService") @RequestHeader("External-Permission-Service")
             PermissionChecker.ExternalPermissionService permissionService */) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @ApiOperation("Hakee annetun henkilön yhteystietoryhmän yhteystiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    // TODO: use proper organization related checks when implemented, used to be:
    // @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot/{ryhma}", method = RequestMethod.GET)
    public YhteystiedotDto getHenkiloYhteystiedot(@ApiParam("Henkilön OID") @PathVariable("oid") String oid,
                                                  @ApiParam("Ryhmän nimi tai kuvaus") @PathVariable("ryhma") String ryhma
                                                  /** Used to be: @P("permissionService") @RequestHeader("External-Permission-Service")
                                                   PermissionChecker.ExternalPermissionService permissionService */) {
        return henkiloService.getHenkiloYhteystiedot(oid, YhteystietoRyhma.forValue(ryhma))
                .orElseThrow(() -> new ResourceNotFoundException("Yhteystiedot not found by ryhma="+ryhma));
    }
}
