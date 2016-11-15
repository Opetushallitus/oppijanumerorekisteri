package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.google.common.collect.Lists;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Api(tags = "Henkilot")
@RestController
@RequestMapping("/henkilo")
public class HenkiloController {
    private HenkiloService henkiloService;

    private PermissionChecker permissionChecker;

    @Autowired
    public HenkiloController(HenkiloService henkiloService, PermissionChecker permissionChecker) {
        this.henkiloService = henkiloService;
        this.permissionChecker = permissionChecker;
    }

    // PROXY
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

    @ApiOperation(value = "Henkilötietojen päivitys",
            notes = "Päivittää kutsussa annetuun OID:n täsmäävän henkilön tiedot")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    public String updateHenkilo(@RequestParam("oid") String oid, HenkiloDto henkilo,
                                  @RequestHeader("External-Permission-Service")
                                          ExternalPermissionService permissionService) {
//        henkilo.setKasittelijaOid(getCurrentUserOid());
//
//        HenkiloDto result = userManagementBusinessService.updateHenkilo(henkilo, true, LdapSynchronization.ASAP_PRIORITY);
//        response = Response.ok(result.getOidHenkilo()).build();

        return null;
    }

    @ApiOperation("Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getAllHenkiloYhteystiedot(
            @PathVariable("oid") String oid,
            @RequestHeader(value = "External-Permission-Service", required = false)
                    ExternalPermissionService permissionService) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @ApiOperation("Hakee annetun henkilön yhteystietoryhmän yhteystiedot")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot/{ryhma}", method = RequestMethod.GET)
    public YhteystiedotDto getHenkiloYhteystiedot(@ApiParam("Henkilön OID") @PathVariable("oid") String oid,
                                                  @ApiParam("Ryhmän nimi tai kuvaus") @PathVariable("ryhma") String ryhma,
                                                  @RequestHeader(value = "External-Permission-Service", required = false)
                                                   ExternalPermissionService permissionService ) {
        return henkiloService.getHenkiloYhteystiedot(oid, YhteystietoRyhma.forValue(ryhma))
                .orElseThrow(() -> new NotFoundException("Yhteystiedot not found by ryhma="+ryhma));
    }

    // PROXY
    @ApiOperation(value = "Henkilön haku OID:n perusteella.",
            notes = "Hakee henkilön tiedot annetun OID:n pohjalta, sisältään kaikki henkilön tiedot.")
    @ApiResponses(value = {@ApiResponse(code = 500, message = "Not Found or internal error")})
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}", method = RequestMethod.GET)
    public ResponseEntity findByOid(@PathVariable String oid,
                                    @RequestHeader("External-Permission-Service")
                                      ExternalPermissionService permissionService) {
        try {
            return new ResponseEntity<>(henkiloService.getHenkiloByOids(Collections.singletonList(oid)), HttpStatus.OK);
        } catch (NotFoundException e) {
            // Returns 500 for backward compability
            Map<String, String> entity = new HashMap<>();
            entity.put("error", e.getMessage());
            return new ResponseEntity<>(entity, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PROXY
    @ApiOperation(value = "Henkilö luonti",
            notes = "Luo uuden henkilön annetun henkilö DTO:n pohjalta.")
    @ApiResponses(value = {@ApiResponse(code = 500, message = "Internal error"), @ApiResponse(code = 400, message = "bad input")})
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "", method = RequestMethod.POST)
    public String createHenkilo(@RequestBody @Validated HenkiloDto henkilo) {
        return this.henkiloService.createHenkiloFromHenkiloDTo(henkilo).getOidhenkilo();
    }

    // PROXY, probably slower than the original
    @ApiOperation(value = "Henkilöiden haku OID:ien perusteella.",
            notes = "Hakee henkilöiden tiedot annetun OID:ien pohjalta, sisältään kaikkien henkilön kaikki tiedot.")
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkilotByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloDto> findHenkilotByOidList(List<String> oids,
                                                  @RequestHeader("External-Permission-Service")
                                                          ExternalPermissionService permissionService) throws IOException {
        return permissionChecker.getPermissionCheckedHenkilos(
                this.henkiloService.getHenkiloByOids(oids),
                Lists.newArrayList("READ", "READ_UPDATE", "CRUD"),
                permissionService
        );
    }

    // PROXY
    @ApiOperation(value = "Hakee henkilön tiedot annetun tunnistetiedon avulla.",
            notes = "Hakee henkilön tiedot annetun tunnistetiedon avulla.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PostAuthorize("returnObject == null || @permissionChecker.isAllowedToAccessPerson(returnObject.getOidhenkilo(), " +
            "{'READ', 'READ_UPDATE', 'CRUD'}, null)")
    @RequestMapping(value = "/identification", method = RequestMethod.GET)
    public HenkiloDto findByIDPAndIdentifier(@ApiParam("Tunnistetiedon tyyppi") @RequestParam("idp") String idp,
                                          @ApiParam("Varsinainen tunniste") @RequestParam("id") String identifier) {
        return this.henkiloService.getHenkiloByIDPAndIdentifier(idp, identifier);
    }

    // PROXY
    @ApiOperation(value = "Listaa sallitut henkilötyypit henkilöiden luontiin liittyen.",
            notes = "Listaa ne henkilötyypit joita kirjautunt käyttäjä saa luoda henkilöhallintaan.")
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkilotypes", method = RequestMethod.GET)
    public List<String> findPossibleHenkiloTypes() {
        return this.henkiloService.listPossibleHenkiloTypesAccessible();
    }


}
