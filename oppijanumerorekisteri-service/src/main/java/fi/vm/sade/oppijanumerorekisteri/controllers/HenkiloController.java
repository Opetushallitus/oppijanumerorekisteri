package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.Slice;
import com.google.common.collect.Lists;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
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
import javax.validation.constraints.Min;


@Api(tags = "Henkilot")
@RestController
@RequestMapping("/henkilo")
@Validated
public class HenkiloController {
    private HenkiloService henkiloService;
    private IdentificationService identificationService;

    private PermissionChecker permissionChecker;
    private final YksilointiService yksilointiService;

    @Autowired
    public HenkiloController(HenkiloService henkiloService,
                             IdentificationService identificationService,
                             PermissionChecker permissionChecker,
                             YksilointiService yksilointiService) {
        this.henkiloService = henkiloService;
        this.identificationService = identificationService;
        this.permissionChecker = permissionChecker;
        this.yksilointiService = yksilointiService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_KKVASTUU',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    public Slice<HenkiloHakuDto> list(
            HenkiloHakuCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count) {
        return henkiloService.list(criteria, page, count);
    }

    @GetMapping("/hakutermi={hakutermi}")
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_KKVASTUU',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Hakee henkilön hakutermin perusteella.",
            notes = "Hakutermillä haetaan henkilön nimen, henkilötunnuksen ja OID:n mukaan."
                    + " Jos henkilöitä löytyy useita, palautetaan niistä nimen mukaan ensimmäinen."
                    + " Tämä on ensisijaisesti tehty suoritusrekisterin käyttöliittymälle.")
    public HenkiloHakuDto getByHakutermi(
            @PathVariable String hakutermi,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getByHakutermi(hakutermi, permissionService);
    }

    @GetMapping("/yhteystieto={arvo}/oid")
    @PreAuthorize("hasRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Hakee henkilöiden OID:t yhteystiedon perusteella.")
    public Iterable<String> getByYhteystieto(@PathVariable String arvo) {
        return henkiloService.listOidByYhteystieto(arvo);
    }

    @ApiOperation("Palauttaa tiedon, onko kirjautuneella käyttäjällä henkilötunnus järjestelmässä")
    @RequestMapping(value = "/current/hasHetu", method = RequestMethod.GET)
    public Boolean hasHetu() {
        // get oid from security context
        return henkiloService.getHasHetu();
    }

    @ApiOperation("Hakee henkilöiden OID:n, HeTu:n ja nimet nimen perusteella")
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerusByName", method = RequestMethod.GET)
    public List<HenkiloOidHetuNimiDto> henkiloOidHetuNimisByName(@RequestParam(value = "etunimet") String etunimet,
                                                                 @RequestParam(value = "sukunimi") String sukunimi) {
        return this.henkiloService.getHenkiloOidHetuNimiByName(etunimet, sukunimi);
    }

    @ApiOperation(value = "Hakee henkilön OID:n, HeTu:n ja nimet henkilötunnuksen perusteella")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerusByHetu/{hetu}", method = RequestMethod.GET)
    public HenkiloOidHetuNimiDto henkiloOidHetuNimiByHetu(@PathVariable String hetu) {
        return this.henkiloService.getHenkiloOidHetuNimiByHetu(hetu);
    }

    @ApiOperation("Hakee annetun henkilö OID listaa vastaavien henkilöiden perustiedot. Rajapinnasta saa hakea enintään 5000 henkilön tietoja kerralla.")
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_READ',"
            + "'ROLE_APP_HENKILONHALLINTA_READ_UPDATE',"
            + "'ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerustietosByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(@ApiParam("Format: [\"oid1\", ...]") @RequestBody List<String> henkiloOids) {
        return this.henkiloService.getHenkiloPerustietoByOids(henkiloOids);
    }

    @ApiOperation(value = "Henkilötietojen päivitys",
            notes = "Päivittää kutsussa annetuun OID:n täsmäävän henkilön tiedot")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#henkiloUpdateDto.oidHenkilo, {'HENKILONHALLINTA': {'READ_UPDATE', 'CRUD'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public String updateHenkilo(@RequestBody @Validated HenkiloUpdateDto henkiloUpdateDto,
                                @RequestHeader(value = "External-Permission-Service", required = false)
                                        ExternalPermissionService permissionService) throws BindException {
        return this.henkiloService.updateHenkilo(henkiloUpdateDto).getOidHenkilo();
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
    @RequestMapping(value = "/{oid}/yhteystiedot/{tyyppi}", method = RequestMethod.GET)
    public YhteystiedotDto getHenkiloYhteystiedot(@ApiParam("Henkilön OID") @PathVariable("oid") String oid,
                                                  @ApiParam("Koodisto \"yhteystietotyypit\"") @PathVariable("tyyppi") String tyyppi,
                                                  @RequestHeader(value = "External-Permission-Service", required = false)
                                                          ExternalPermissionService permissionService) {
        return henkiloService.getHenkiloYhteystiedot(oid, tyyppi)
                .orElseThrow(() -> new NotFoundException("Yhteystiedot not found by tyyppi=" + tyyppi));
    }

    @ApiOperation(value = "Henkilön haku OID:n perusteella.",
            notes = "Hakee henkilön tiedot annetun OID:n pohjalta, sisältään kaikki henkilön tiedot.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'HENKILONHALLINTA': {'READ', 'READ_UPDATE', 'CRUD'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}", method = RequestMethod.GET)
    public HenkiloDto findByOid(@PathVariable String oid,
                                @RequestHeader(value = "External-Permission-Service", required = false)
                                        ExternalPermissionService permissionService) {
        return henkiloService.getHenkilosByOids(Collections.singletonList(oid))
                .stream().findFirst().orElseThrow(NotFoundException::new);
    }

    @ApiOperation(value = "Palauttaa, onko annettu henkilö OID järjestelmässä",
            notes = "Jos henkilö löytyy, palautuu ok (200), muuten not found (404)")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'HENKILONHALLINTA': {'READ', 'READ_UPDATE', 'CRUD'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @RequestMapping(value = "/{oid}", method = RequestMethod.HEAD)
    public ResponseEntity oidExists(@PathVariable String oid,
                                    @RequestHeader(value = "External-Permission-Service", required = false)
                                            ExternalPermissionService permissionService) {
        if (this.henkiloService.getOidExists(oid)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/{oid}", method = RequestMethod.DELETE)
    @ApiOperation(value = "Passivoi henkilön mukaanlukien käyttöoikeudet ja organisaatiot.",
            notes = "Asettaa henkilön passivoiduksi, henkilön tietoja ei poisteta.",
            authorizations = @Authorization("ROLE_APP_HENKILONHALLINTA_OPHREKISTERI"))
    public void passivateHenkilo(@ApiParam("Henkilön OID") @PathVariable("oid") String oid) throws IOException {
        this.henkiloService.disableHenkilo(oid);
    }

    @ApiOperation(value = "Henkilön haku OID:n perusteella.",
            notes = "Palauttaa henkilön master version jos annettu OID on duplikaatin henkilön slave versio.")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'HENKILONHALLINTA': {'READ', 'READ_UPDATE', 'CRUD'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
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

    @ApiOperation(value = "Henkilö luonti",
            notes = "Luo uuden henkilön annetun henkilö DTO:n pohjalta.")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "bad input")})
    @PreAuthorize("hasAnyRole('ROLE_APP_HENKILONHALLINTA_CRUD',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ResponseStatus(HttpStatus.CREATED)
    @RequestMapping(value = "", method = RequestMethod.POST)
    public String createHenkiloFromHenkiloCreateDto(@ApiParam("Henkilön sukupuolen kelvolliset arvot löytyvät sukupuoli koodistosta.")
                                                    @RequestBody @Validated HenkiloCreateDto henkilo) throws BindException {
        return this.henkiloService.createHenkilo(henkilo).getOidHenkilo();
    }

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

    @ApiOperation(value = "Hakee henkilön tiedot annetun tunnistetiedon avulla.",
            notes = "Hakee henkilön tiedot annetun tunnistetiedon avulla.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PostAuthorize("@permissionChecker.isAllowedToAccessPerson(returnObject.oidHenkilo, {'READ', 'READ_UPDATE', 'CRUD'}, null)")
    @RequestMapping(value = "/identification", method = RequestMethod.GET)
    public HenkiloDto findByIdpAndIdentifier(@ApiParam(value = "Tunnistetiedon tyyppi", required = true) @RequestParam("idp") String idp,
                                             @ApiParam(value = "Varsinainen tunniste", required = true) @RequestParam("id") String identifier) {
        return this.henkiloService.getHenkiloByIDPAndIdentifier(idp, identifier);
    }

    @GetMapping("/{oid}/identification")
    @ApiOperation("Henkilön tunnistetietojen haku.")
    @PreAuthorize("hasRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    public Iterable<IdentificationDto> getIdentifications(@PathVariable String oid) {
        return identificationService.listByHenkiloOid(oid);
    }

    @PostMapping("/{oid}/identification")
    @ApiOperation("Henkilön tunnistetietojen lisääminen.")
    @PreAuthorize("hasRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    public Iterable<IdentificationDto> addIdentification(@PathVariable String oid,
                                                         @RequestBody @Validated IdentificationDto identification) {
        return identificationService.create(oid, identification);
    }

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

    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#henkiloOid, {'KKVASTUU', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yksiloi", method = RequestMethod.POST)
    @ApiOperation(value = "Käynnistää henkilön yksilöinnin.",
            notes = "Käynnistää henkilön yksilöintiprosessin VTJ:n suuntaan manuaalisesti.",
            authorizations = {@Authorization("ROLE_APP_HENKILONHALLINTA_READ_UPDATE"),
                    @Authorization("ROLE_APP_HENKILONHALLINTA_CRUD"),
                    @Authorization("ROLE_APP_HENKILONHALLINTA_KKVASTUU"),
                    @Authorization("ROLE_APP_HENKILONHALLINTA_OPHREKISTERI")})
    public void yksiloiManuaalisesti(@ApiParam(value = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
                                     @RequestHeader(value = "External-Permission-Service", required = false)
                                             ExternalPermissionService permissionService) {
        this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
    }

    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#henkiloOid, {'KKVASTUU', 'READ_UPDATE', 'CRUD'}, #permissionService )")
    @RequestMapping(value = "/{oid}/yksiloihetuton", method = RequestMethod.POST)
    @ApiOperation(value = "Yksilöi hetuttoman henkilön.",
    notes = "Yksilöi hetuttoman henkilön.",
    authorizations = {@Authorization("ROLE_APP_HENKILONHALLINTA_READ_UPDATE"),
            @Authorization("ROLE_APP_HENKILONHALLINTA_CRUD"),
            @Authorization("ROLE_APP_HENKILONHALLINTA_KKVASTUU"),
            @Authorization("ROLE_APP_HENKILONHALLINTA_OPHREKISTERI")})
    public void yksiloiHetuton(@ApiParam(value = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
    @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.yksilointiService.hetuttomanYksilointi(henkiloOid);
    }


    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#henkiloOid, {'KKVASTUU', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/purayksilointi", method = RequestMethod.POST)
    @ApiOperation(value = "Henkilön yksilöinnin purku.",
            notes = "Purkaa hetuttoman henkilön yksilöinnin",
            authorizations = {@Authorization("ROLE_APP_HENKILONHALLINTA_OPHREKISTERI")})
    public void puraYksilointi(@ApiParam(value = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
                               @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.yksilointiService.puraHeikkoYksilointi(henkiloOid);
    }

    @PutMapping("/{oid}/yksilointitiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_KAYTTOOIKEUS_SCHEDULE',"
            + "'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation("Päivittään yksilöidyn henkilön tiedot VTJ:stä")
    public void paivitaYksilointitiedot(@PathVariable String oid) {
        yksilointiService.paivitaYksilointitiedot(oid);
    }

    @GetMapping("/{oid}/yksilointitiedot")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @ApiOperation("Hakee henkilön yksilöintitiedot oidin perusteella")
    public YksilointitietoDto getYksilointitiedot(@PathVariable String oid,
                                                  @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return yksilointiService.getYksilointiTiedot(oid);
    }

    @PutMapping("/{oid}/yksilointitiedot/yliajayksiloimaton")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @ApiOperation("Yliajaa henkilön tiedot yksilöintitiedoilla. Tarkoitettu henkilöille, joiden VTJ-yksilöinti on epäonnistunut")
    public void yliajaHenkilonTiedot(@PathVariable String oid,
                                     @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        yksilointiService.yliajaHenkilonTiedot(oid);
    }

    @GetMapping("/{oid}/yksilointi")
    @PreAuthorize("hasRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation("Listaa palvelutunnisteet joilla yksilöinti on aktiivinen henkilölle")
    public Iterable<String> listPalvelutunnisteet(@PathVariable String oid) {
        return yksilointiService.listPalvelutunnisteet(oid);
    }

    @PutMapping("/{oid}/yksilointi/{palvelutunniste}")
    @PreAuthorize("hasRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation("Aktivoi yksilöinnin annetulle palvelutunnisteelle")
    public void enableYksilointi(@PathVariable String oid, @PathVariable String palvelutunniste) {
        yksilointiService.enableYksilointi(oid, palvelutunniste);
    }

    @DeleteMapping("/{oid}/yksilointi/{palvelutunniste}")
    @PreAuthorize("hasRole('ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation("Kytkee yksilöinnin pois päältä annetulta palvelutunnisteelta")
    public void disableYksilointi(@PathVariable String oid, @PathVariable String palvelutunniste) {
        yksilointiService.disableYksilointi(oid, palvelutunniste);
    }

    @GetMapping("/{oid}/slaves")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @ApiOperation("Hakee henkilön duplikaatit oidin perusteella")
    public List<HenkiloReadDto> findSlavesByMasterOid(
            @PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.findSlavesByMasterOid(oid);
    }

    @GetMapping("/{oid}/duplicates")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'KKVASTUU', 'READ_UPDATE', 'CRUD'}, #permissionService)")
    @ApiOperation("Hakee henkilon duplikaatit nimeä vertailemalla")
    public List<HenkiloDuplicateDto> findDuplicates(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.findDuplicates(oid);
    }

    @GetMapping("/duplikaatit")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation("Hakee duplikaatit nimeä vertailemalla")
    public List<HenkiloDuplicateDto> getDuplikaatit(
            @RequestParam String etunimet,
            @RequestParam String kutsumanimi,
            @RequestParam String sukunimi) {
        HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(etunimet, kutsumanimi, sukunimi);
        return henkiloService.getDuplikaatit(criteria);
    }

    @PostMapping("/{oid}/link")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'CRUD', 'KKVASTUU'}, #permissionService)")
    @ApiOperation("Linkittää henkilöön annetun joukon duplikaatteja")
    public List<String> linkDuplicates(@PathVariable String oid, @RequestBody List<String> slaveOids,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.linkHenkilos(oid, slaveOids);
    }

    @DeleteMapping("/{oid}/unlink/{slaveOid}")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'CRUD', 'KKVASTUU'}, #permissionService)")
    @ApiOperation("Poistaa henkilöltä linkityksen toiseen henkilöön")
    public void unlinkHenkilo(@PathVariable String oid, @PathVariable String slaveOid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.henkiloService.unlinkHenkilo(oid, slaveOid);
    }

    @ApiOperation("Hae käyttäjän asiointikieli tai jos ei ole asetettu oletuksena suomi")
    @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oidHenkilo, {'HENKILONHALLINTA': {'READ', 'READ_UPDATE', 'CRUD'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oidHenkilo}/asiointiKieli", method = RequestMethod.GET)
    public String getAsiointikieli(@PathVariable String oidHenkilo,
                                   @RequestHeader(value = "External-Permission-Service", required = false)
                                           ExternalPermissionService permissionService) {
        return this.henkiloService.getAsiointikieli(oidHenkilo);
    }

    @ApiOperation("Hae kirjautuneen käyttäjän asiointikieli tai jos ei ole asetettu oletuksena suomi")
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/current/asiointiKieli", method = RequestMethod.GET)
    public String getCurrentUserAsiointikieli() {
        return this.henkiloService.getCurrentUserAsiointikieli();
    }
}
