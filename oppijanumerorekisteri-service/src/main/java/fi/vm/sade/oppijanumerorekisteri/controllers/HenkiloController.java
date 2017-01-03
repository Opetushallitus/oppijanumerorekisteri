package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.google.common.collect.Lists;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.List;


@Api(tags = "Henkilot")
@RestController
@RequestMapping("/henkilo")
public class HenkiloController {
    private HenkiloService henkiloService;

    private PermissionChecker permissionChecker;
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;

    @Autowired
    public HenkiloController(HenkiloService henkiloService,
                             PermissionChecker permissionChecker,
                             HenkiloUpdatePostValidator henkiloUpdatePostValidator) {
        this.henkiloService = henkiloService;
        this.permissionChecker = permissionChecker;
        this.henkiloUpdatePostValidator = henkiloUpdatePostValidator;
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
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(@ApiParam("Format: [\"oid1\", ...]") @RequestBody List<String> henkiloOids) {
        return this.henkiloService.getHenkiloPerustietoByOids(henkiloOids);
    }

    @ApiOperation(value = "Henkilötietojen päivitys",
            notes = "Päivittää kutsussa annetuun OID:n täsmäävän henkilön tiedot")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#henkiloUpdateDto.oidHenkilo, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public String updateHenkilo(@RequestBody @Validated HenkiloUpdateDto henkiloUpdateDto,
                                  @RequestHeader(value = "External-Permission-Service", required = false)
                                          ExternalPermissionService permissionService) throws BindException {
        return this.henkiloService.updateHenkiloFromHenkiloUpdateDto(henkiloUpdateDto).getOidHenkilo();
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
        return henkiloService.getHenkiloYhteystiedot(oid, YhteystietoRyhmaKuvaus.forValue(ryhma))
                .orElseThrow(() -> new NotFoundException("Yhteystiedot not found by ryhma="+ryhma));
    }

    // PROXY
    @ApiOperation(value = "Henkilön haku OID:n perusteella.",
            notes = "Hakee henkilön tiedot annetun OID:n pohjalta, sisältään kaikki henkilön tiedot.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}", method = RequestMethod.GET)
    public HenkiloDto findByOid(@PathVariable String oid,
                                @RequestHeader(value = "External-Permission-Service", required = false)
                                        ExternalPermissionService permissionService) {
        return henkiloService.getHenkilosByOids(Collections.singletonList(oid))
                .stream().findFirst().orElseThrow(NotFoundException::new);
    }

    @ApiOperation(value = "Palauttaa, onko annettu henkilö OID järjestelmässä",
            notes = "Jos henkilö löytyy, palautuu ok (200), muuten not found (404)")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @RequestMapping(value = "/{oid}", method = RequestMethod.HEAD)
    public ResponseEntity oidExists(@PathVariable String oid,
                                    @RequestHeader(value = "External-Permission-Service", required = false)
                                            ExternalPermissionService permissionService) {
        if (this.henkiloService.getOidExists(oid)) {
            return ResponseEntity.ok().build();
        }
        else {
            return ResponseEntity.notFound().build();
        }
    }


    @ApiOperation(value = "Henkilön haku OID:n perusteella.",
            notes = "Palauttaa henkilön master version jos annettu OID on duplikaatin henkilön slave versio.")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/master", method = RequestMethod.GET)
    public HenkiloReadDto getMasterByOid(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false)
                    ExternalPermissionService permissionService) {
        return henkiloService.getMasterByOid(oid);
    }

    @ApiOperation("Henkilön haku henkilötunnuksen perusteella.")
    @PostAuthorize("@permissionChecker.isAllowedToAccessPerson(returnObject.oidHenkilo, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/hetu={hetu}", method = RequestMethod.GET)
    public HenkiloReadDto getByHetu(@PathVariable String hetu,
            @RequestHeader(value = "External-Permission-Service", required = false)
                    ExternalPermissionService permissionService) {
        return henkiloService.getByHetu(hetu);
    }

    // PROXY
    @ApiOperation(value = "Henkilö luonti",
            notes = "Luo uuden henkilön annetun henkilö DTO:n pohjalta.")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "bad input")})
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ResponseStatus(HttpStatus.CREATED)
    @RequestMapping(value = "", method = RequestMethod.POST)
    public String createHenkiloFromHenkiloCreateDto(@RequestBody @Validated HenkiloCreateDto henkilo) {
        return this.henkiloService.createHenkilo(henkilo).getOidHenkilo();
    }

    // PROXY, probably slower than the original
    @ApiOperation(value = "Henkilöiden haku OID:ien perusteella.",
            notes = "Hakee henkilöiden tiedot annetun OID:ien pohjalta, sisältään kaikkien henkilön kaikki tiedot.")
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkilotByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloDto> findHenkilotByOidList(@ApiParam("Format: [\"oid1\", ...]") @RequestBody List<String> oids,
                                                  @RequestHeader(value = "External-Permission-Service", required = false)
                                                          ExternalPermissionService permissionService) throws IOException {
        return this.permissionChecker.getPermissionCheckedHenkilos(
                this.henkiloService.getHenkilosByOids(oids),
                Lists.newArrayList("READ", "READ_UPDATE", "CRUD"),
                permissionService
        );
    }

    // PROXY
    @ApiOperation(value = "Hakee henkilön tiedot annetun tunnistetiedon avulla.",
            notes = "Hakee henkilön tiedot annetun tunnistetiedon avulla.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PostAuthorize("@permissionChecker.isAllowedToAccessPerson(returnObject.oidHenkilo, {'READ', 'READ_UPDATE', 'CRUD'}, null)")
    @RequestMapping(value = "/identification", method = RequestMethod.GET)
    public HenkiloDto findByIdpAndIdentifier(@ApiParam(value = "Tunnistetiedon tyyppi", required = true) @RequestParam("idp") String idp,
                                          @ApiParam(value = "Varsinainen tunniste", required = true) @RequestParam("id") String identifier) {
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
