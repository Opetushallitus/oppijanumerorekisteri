package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.google.common.collect.Sets;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.filter.AuditLogRead;
import fi.vm.sade.oppijanumerorekisteri.logging.LogExecutionTime;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import io.swagger.annotations.*;
import lombok.AllArgsConstructor;
import lombok.Generated;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.joda.time.DateTime;
import org.springframework.core.env.Environment;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.*;


@Api(tags = "Henkilot")
@RestController
@RequestMapping("/henkilo")
@Validated
@RequiredArgsConstructor
public class HenkiloController {
    private final HenkiloService henkiloService;
    private final HenkiloModificationService henkiloModificationService;
    private final DuplicateService duplicateService;
    private final IdentificationService identificationService;

    private final PermissionChecker permissionChecker;
    private final YksilointiService yksilointiService;

    private final Environment environment;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @ApiOperation(value = "Hakee henkilöiden perustiedot annetuilla hakukriteereillä",
            notes = "Korvaava rajapinta: POST /kayttooikeus-service/virkailija/haku")
    @Deprecated // riippuvuus käyttöoikeuspalveluun
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public Slice<HenkiloHakuDto> list(
            HenkiloHakuCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count) {
        return henkiloService.list(criteria, page, count);
    }

    @GetMapping("/hakutermi={hakutermi}")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @ApiOperation(value = "Hakee henkilön hakutermin perusteella.",
            notes = "Hakutermillä haetaan henkilön nimen, henkilötunnuksen ja OID:n mukaan."
                    + " Jos henkilöitä löytyy useita, palautetaan niistä nimen mukaan ensimmäinen."
                    + " Tämä on ensisijaisesti tehty suoritusrekisterin käyttöliittymälle.")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloHakuDto getByHakutermi(
            @PathVariable String hakutermi,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getByHakutermi(hakutermi);
    }

    @GetMapping("/yhteystieto={arvo}/oid")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @ApiOperation(value = "Hakee henkilöiden OID:t yhteystiedon perusteella.")
    public Iterable<String> getByYhteystieto(@PathVariable String arvo) {
        return henkiloService.listOidByYhteystieto(arvo);
    }

    @PostMapping("/yhteystiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @ApiOperation("Hakee henkilöiden perustiedot sekä yhteystiedot annetuilla hakukriteereillä")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public Iterable<HenkiloYhteystiedotDto> getYhteystiedot(@RequestBody HenkiloCriteria criteria) {
        return henkiloService.listWithYhteystiedotAsAdmin(criteria);
    }

    @ApiOperation("Palauttaa tiedon, onko kirjautuneella käyttäjällä henkilötunnus järjestelmässä")
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/current/hasHetu", method = RequestMethod.GET)
    public Boolean hasHetu() {
        // get oid from security context
        return henkiloService.getHasHetu();
    }

    @ApiOperation(value = "Hakee henkilön OID:n, HeTu:n ja nimet henkilötunnuksen perusteella")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/henkiloPerusByHetu/{hetu}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloOidHetuNimiDto henkiloOidHetuNimiByHetu(@PathVariable String hetu) {
        return this.henkiloService.getHenkiloOidHetuNimiByHetu(hetu);
    }

    @ApiOperation("Hakee annetun henkilö OID listaa vastaavien henkilöiden perustiedot. Rajapinnasta saa hakea enintään 5000 henkilön tietoja kerralla.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/henkiloPerustietosByHenkiloOidList", method = RequestMethod.POST)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(@ApiParam("Format: [\"oid1\", ...]") @RequestBody List<String> henkiloOids) {
        List<HenkiloPerustietoDto> henkiloPerustietoDtos = this.henkiloService.getHenkiloPerustietoByOids(henkiloOids);
        Boolean permissionCheckDisabled = environment.getProperty("oppijanumerorekisteri.disable-strict-permission-check", Boolean.class, false);
        if (Boolean.TRUE.equals(permissionCheckDisabled)) {
            return henkiloPerustietoDtos;
        }
        return this.permissionChecker.filterUnpermittedHenkiloPerustieto(henkiloPerustietoDtos,
                Collections.singletonMap(PALVELU_OPPIJANUMEROREKISTERI, Collections.singletonList(KAYTTOOIKEUS_HENKILON_RU)),
                null);
    }

    @ApiOperation(value = "Henkilötietojen päivitys",
            notes = "Päivittää kutsussa annetuun OID:n täsmäävän henkilön tiedot")
    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#henkiloUpdateDto.oidHenkilo, {'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}, 'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public String updateHenkilo(@RequestBody @Validated HenkiloUpdateDto henkiloUpdateDto,
                                @RequestHeader(value = "External-Permission-Service", required = false)
                                        ExternalPermissionService permissionService) {
        return this.henkiloModificationService.updateHenkilo(henkiloUpdateDto).getOidHenkilo();
    }

    @ApiOperation("Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getAllHenkiloYhteystiedot(
            @PathVariable("oid") String oid,
            @RequestHeader(value = "External-Permission-Service", required = false)
                    ExternalPermissionService permissionService) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @ApiOperation("Hakee annetun henkilön yhteystietoryhmän yhteystiedot")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
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
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloDto findByOid(@PathVariable String oid,
                                @RequestHeader(value = "External-Permission-Service", required = false)
                                        ExternalPermissionService permissionService) {
        return henkiloService.getHenkilosByOids(Collections.singletonList(oid))
                .stream().findFirst().orElseThrow(NotFoundException::new);
    }

    @ApiOperation(value = "Palauttaa, onko annettu henkilö OID järjestelmässä",
            notes = "Jos henkilö löytyy, palautuu ok (200), muuten not found (404)")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
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

    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/{oid}", method = RequestMethod.DELETE)
    @ApiOperation(value = "Passivoi henkilön mukaanlukien käyttöoikeudet ja organisaatiot.",
            notes = "Asettaa henkilön passivoiduksi, henkilön tietoja ei poisteta.",
            authorizations = {@Authorization("ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA"),
                    @Authorization("ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU")})
    public void passivateHenkilo(@ApiParam("Henkilön OID") @PathVariable("oid") String oid) {
        this.henkiloModificationService.disableHenkilo(oid);
    }

    @ApiOperation(value = "Henkilön haku OID:n perusteella.",
            notes = "Palauttaa henkilön master version jos annettu OID on duplikaatin henkilön slave versio.")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/master", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloReadDto getMasterByOid(@PathVariable String oid,
                                         @RequestHeader(value = "External-Permission-Service", required = false)
                                                 ExternalPermissionService permissionService) {
        return henkiloService.getMasterByOid(oid);
    }

    @ApiOperation("Henkilön haku henkilötunnuksen perusteella.")
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/hetu={hetu}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloReadDto getByHetu(@PathVariable String hetu,
                                    @RequestHeader(value = "External-Permission-Service", required = false)
                                            ExternalPermissionService permissionService) {
        return henkiloService.getByHetu(hetu);
    }

    @ApiOperation(value = "Henkilö luonti",
            notes = "Luo uuden henkilön annetun henkilö DTO:n pohjalta.")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "bad input")})
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ResponseStatus(HttpStatus.CREATED)
    @RequestMapping(value = "", method = RequestMethod.POST)
    public String createHenkiloFromHenkiloCreateDto(@ApiParam("Henkilön sukupuolen kelvolliset arvot löytyvät sukupuoli koodistosta.")
                                                    @RequestBody @Validated HenkiloCreateDto henkilo) {
        return this.henkiloModificationService.createHenkilo(henkilo).getOidHenkilo();
    }

    @ApiOperation(value = "Henkilön olemassaolon tarkistus",
            notes = "Tarkistaa henkilön olemassa olon annetun syötteen pohjalta.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Henkilölle löytyi oppijanumero", response = ExistenceCheckResult.class),
            @ApiResponse(code = 204, message = "Henkilö on olemassa muttei oppijanumerorekisterissä", response = ExistenceCheckResult.class),
            @ApiResponse(code = 400, message = "Viallinen syöte"),
            @ApiResponse(code = 404, message = "Henkilöä ei löydy annetuin tiedoin"),
            @ApiResponse(code = 409, message = "Henkilön tiedot virheelliset"),
    })
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @PostMapping(value = "/exists")
    public ResponseEntity<ExistenceCheckResult> existenceCheck(@ApiParam("Henkilön yksilöivät tiedot.")
                                                               @RequestBody @Validated HenkiloExistenceCheckDto details) {
        String oid = yksilointiService.exists(details);
        return new ResponseEntity<>(new ExistenceCheckResult(oid), oid.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }


    @ApiOperation(value = "Henkilöiden haku OID:ien perusteella.",
            notes = "Hakee henkilöiden tiedot annetun OID:ien pohjalta, sisältään kaikkien henkilön kaikki tiedot.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/henkilotByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloDto> findHenkilotByOidList(@ApiParam("Format: [\"oid1\", ...]") @RequestBody List<String> oids,
                                                  @RequestHeader(value = "External-Permission-Service", required = false)
                                                          ExternalPermissionService permissionService) throws IOException {
        return this.permissionChecker.filterUnpermittedHenkilo(
                this.henkiloService.getHenkilosByOids(oids),
                Collections.singletonMap("OPPIJANUMEROREKISTERI", Arrays.asList("READ", "HENKILON_RU")),
                permissionService
        );
    }

    @ApiOperation(value = "Henkilöiden master tietojen haku OID:ien perusteella max 5000 kerrallaan.",
            notes = "Hakee henkilöiden master tiedot annetun OID:ien pohjalta max 5000 kerrallaan.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/masterHenkilosByOidList", method = RequestMethod.POST)
    public Map<String, HenkiloDto> masterHenkilosByOidList(@ApiParam("Format: [\"oid1\", ...]") @RequestBody List<String> oids,
                                                           @RequestHeader(value = "External-Permission-Service", required = false)
                                                                   ExternalPermissionService permissionService) throws IOException {
        return this.permissionChecker.filterUnpermittedHenkilo(
                this.henkiloService.getMastersByOids(Sets.newHashSet(oids)),
                Collections.singletonMap(PALVELU_OPPIJANUMEROREKISTERI, Arrays.asList(KAYTTOOIKEUS_READ, KAYTTOOIKEUS_HENKILON_RU)),
                permissionService
        );
    }

    @ApiOperation(value = "Hakee henkilön tiedot annetun tunnistetiedon avulla.",
            notes = "Hakee henkilön tiedot annetun tunnistetiedon avulla.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, null)")
    @RequestMapping(value = "/identification", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloDto findByIdpAndIdentifier(@ApiParam(value = "Tunnistetiedon tyyppi", required = true) @RequestParam("idp") String idp,
                                             @ApiParam(value = "Varsinainen tunniste", required = true) @RequestParam("id") String identifier) {
        return this.henkiloService.getHenkiloByIDPAndIdentifier(idp, identifier);
    }

    @GetMapping("/{oid}/identification")
    @ApiOperation("Henkilön tunnistetietojen haku.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    public Iterable<IdentificationDto> getIdentifications(@PathVariable String oid) {
        return identificationService.listByHenkiloOid(oid);
    }

    @PostMapping("/{oid}/identification")
    @ApiOperation("Henkilön tunnistetietojen lisääminen.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    public Iterable<IdentificationDto> addIdentification(@PathVariable String oid,
                                                         @RequestBody @Validated IdentificationDto identification) {
        return identificationService.create(oid, identification);
    }

    @DeleteMapping("/{oid}/identification/{idpEntityId}/{identifier}")
    @ApiOperation("Henkilön tunnistetietojen poistaminen")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    public Iterable<IdentificationDto> removeIdentification(@PathVariable String oid,
                                                            @PathVariable String idpEntityId,
                                                            @PathVariable String identifier) {
        return identificationService.remove(oid, IdentificationDto.of(idpEntityId, identifier));
    }


    @ApiOperation(value = "Listaa sallitut henkilötyypit henkilöiden luontiin liittyen.",
            notes = "Listaa ne henkilötyypit joita kirjautunt käyttäjä saa luoda henkilöhallintaan.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @RequestMapping(value = "/henkilotypes", method = RequestMethod.GET)
    public List<String> findPossibleHenkiloTypes() {
        return this.henkiloService.listPossibleHenkiloTypesAccessible();
    }

    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#henkiloOid, {'OPPIJANUMEROREKISTERI': {'MANUAALINEN_YKSILOINTI'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/yksiloi", method = RequestMethod.POST)
    @ApiOperation(value = "Käynnistää henkilön yksilöinnin.",
            notes = "Käynnistää henkilön yksilöintiprosessin VTJ:n suuntaan manuaalisesti.",
            authorizations = {@Authorization("ROLE_APP_OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI")})
    public void yksiloiManuaalisesti(@ApiParam(value = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
                                     @RequestHeader(value = "External-Permission-Service", required = false)
                                             ExternalPermissionService permissionService) {

        this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
    }

    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#henkiloOid, {'OPPIJANUMEROREKISTERI': {'MANUAALINEN_YKSILOINTI'}} , #permissionService )")
    @RequestMapping(value = "/{oid}/yksiloihetuton", method = RequestMethod.POST)
    @ApiOperation(value = "Yksilöi hetuttoman henkilön.",
            notes = "Yksilöi hetuttoman henkilön.",
            authorizations = {@Authorization("ROLE_APP_OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI")})
    public void yksiloiHetuton(@ApiParam(value = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
                               @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.yksilointiService.hetuttomanYksilointi(henkiloOid);
    }


    @PreAuthorize("@permissionChecker.isSuperUser()")
    @RequestMapping(value = "/{oid}/purayksilointi", method = RequestMethod.POST)
    @ApiOperation(value = "Henkilön yksilöinnin purku.",
            notes = "Purkaa hetuttoman henkilön yksilöinnin",
            authorizations = {@Authorization("ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")})
    public void puraYksilointi(@ApiParam(value = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
                               @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.yksilointiService.puraHeikkoYksilointi(henkiloOid);
    }

    @PutMapping("/{oid}/yksilointitiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation("Päivittään yksilöidyn henkilön tiedot VTJ:stä")
    public void paivitaYksilointitiedot(@PathVariable String oid) {
        yksilointiService.paivitaYksilointitiedot(oid);
    }

    @GetMapping("/{oid}/yksilointitiedot")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @ApiOperation("Hakee henkilön yksilöintitiedot oidin perusteella")
    public YksilointitietoDto getYksilointitiedot(@PathVariable String oid,
                                                  @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return yksilointiService.getYksilointiTiedot(oid);
    }

    @PutMapping("/{oid}/yksilointitiedot/yliajayksiloimaton")
    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#oid, {'OPPIJANUMEROREKISTERI': {'VTJ_VERTAILUNAKYMA'}}, #permissionService)")
    @ApiOperation("Yliajaa henkilön tiedot yksilöintitiedoilla. Tarkoitettu henkilöille, joiden VTJ-yksilöinti on epäonnistunut")
    public void yliajaHenkilonTiedot(@PathVariable String oid,
                                     @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        yksilointiService.yliajaHenkilonTiedot(oid);
    }

    @GetMapping("/yksilointitiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @ApiOperation("Hakee epäonnistuneet yksilöinnit")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public Page<YksilointiVertailuDto> listYksilointitiedot(
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count) {
        return yksilointiService.listEpaonnistunutYksilointi(page, count);
    }

    @GetMapping("/{oid}/asiayhteys/palvelu/")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @ApiOperation("Listaa palvelutunnisteet joilla yksilöinti on aktiivinen henkilölle")
    public Iterable<String> listPalvelutunnisteet(@PathVariable String oid) {
        return yksilointiService.listPalvelutunnisteet(oid);
    }

    @PutMapping("/{oid}/asiayhteys/palvelu/{palvelutunniste}")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation("Aktivoi yksilöinnin annetulle palvelutunnisteelle")
    public void enableYksilointi(@PathVariable String oid, @PathVariable String palvelutunniste) {
        yksilointiService.enableYksilointi(oid, palvelutunniste);
    }

    @DeleteMapping("/{oid}/asiayhteys/palvelu/{palvelutunniste}")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation("Kytkee yksilöinnin pois päältä annetulta palvelutunnisteelta")
    public void disableYksilointi(@PathVariable String oid, @PathVariable String palvelutunniste) {
        yksilointiService.disableYksilointi(oid, palvelutunniste);
    }

    @PostMapping("/{oid}/asiayhteys/hakemus")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation("Aktivoi yksilöinnin annetulle hakemukselle")
    public void enableYksilointi(@PathVariable String oid, @Valid @RequestBody AsiayhteysHakemusDto dto) {
        yksilointiService.enableYksilointi(oid, dto);
    }

    @PutMapping("/{oid}/asiayhteys/kayttooikeus")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation("Aktivoi yksilöinnin käyttöoikeuden perusteella")
    public void enableYksilointi(@PathVariable String oid, @Valid @RequestBody AsiayhteysKayttooikeusDto dto) {
        yksilointiService.enableYksilointi(oid, dto);
    }

    @GetMapping("/{oid}/slaves")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @ApiOperation("Hakee henkilön duplikaatit oidin perusteella")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloReadDto> findSlavesByMasterOid(
            @PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.findSlavesByMasterOid(oid);
    }

    @GetMapping("/{oid}/duplicates")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'DUPLIKAATTINAKYMA'}}, #permissionService)")
    @ApiOperation("Hakee henkilon duplikaatit nimeä vertailemalla")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    @LogExecutionTime
    public List<HenkiloDuplicateDto> findDuplicates(@PathVariable String oid,
                                                    @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.duplicateService.findDuplicates(oid);
    }

    @GetMapping("/{oid}/hakemukset")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'DUPLIKAATTINAKYMA'}}, #permissionService)")
    @ApiOperation("Hakee henkilön hakemukset haku-app:sta ja atarusta.")
    public List<HakemusDto> getApplications(@PathVariable String oid, @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.duplicateService.getApplications(oid);
    }

    @GetMapping("/duplikaatit")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation("Hakee duplikaatit nimeä vertailemalla")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloDuplicateDto> getDuplikaatit(
            @RequestParam String etunimet,
            @RequestParam String kutsumanimi,
            @RequestParam String sukunimi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate syntymaaika) {
        HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(etunimet, kutsumanimi, sukunimi, syntymaaika);
        return this.duplicateService.getDuplikaatit(criteria);
    }

    @PostMapping("/{oid}/link")
    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#oid, {'OPPIJANUMEROREKISTERI': {'DUPLIKAATTINAKYMA'}}, #permissionService)")
    @ApiOperation("Linkittää henkilöön annetun joukon duplikaatteja")
    public List<String> linkDuplicates(@PathVariable String oid, @RequestBody List<String> slaveOids,
                                       @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloModificationService.linkHenkilos(oid, slaveOids);
    }

    @DeleteMapping("/{oid}/unlink/{slaveOid}")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation("Poistaa henkilöltä linkityksen toiseen henkilöön")
    public void unlinkHenkilo(@PathVariable String oid, @PathVariable String slaveOid) {
        this.henkiloModificationService.unlinkHenkilo(oid, slaveOid);
    }

    @ApiOperation("Hae käyttäjän asiointikieli tai jos ei ole asetettu oletuksena suomi")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
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

    @ApiOperation("Hae kirjautuneen käyttäjän omat tiedot. Asiointikieleksi annetaan suomi jos ei asetettu.")
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/current/omattiedot", method = RequestMethod.GET)
    public HenkiloOmattiedotDto getCurrentUserOmatTiedot() {
        return this.henkiloService.getOmatTiedot();
    }

    @ApiOperation("Hae käyttäjän omat tiedot. Asiointikieleksi annetaan suomi jos ei asetettu.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/{oidHenkilo}/omattiedot", method = RequestMethod.GET)
    public HenkiloOmattiedotDto getUserOmatTiedot(@PathVariable String oidHenkilo) {
        return this.henkiloService.getOmatTiedot(oidHenkilo);
    }

    @ApiOperation("Hakee annetun henkilötunnus-listaa vastaavien henkilöiden perustiedot. Rajapinnasta saa hakea enintään 5000 henkilön tietoja kerralla.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/henkiloPerustietosByHenkiloHetuList", method = RequestMethod.POST)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloPerustietoDto> henkilotByHenkiloHetuList(@ApiParam("Format: [\"hetu1\", ...]") @RequestBody List<String> henkiloHetus,
                                                                @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        List<HenkiloPerustietoDto> henkiloPerustietoDtos = this.henkiloService.getHenkiloPerustietoByHetus(henkiloHetus);
        return this.permissionChecker.filterUnpermittedHenkiloPerustieto(henkiloPerustietoDtos,
                Collections.singletonMap(PALVELU_OPPIJANUMEROREKISTERI, Collections.singletonList(KAYTTOOIKEUS_HENKILON_RU)),
                permissionService);
    }

    @ApiOperation("Hae käyttäjän huoltajat oidin perusteella")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/huoltajat", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HuoltajaDto> getHenkiloHuoltajat(@PathVariable String oid, @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.getHenkiloHuoltajat(oid);
    }

    @ApiOperation("Hae huoltajasuhteiden muutokset tietyltä aikaväliltä")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/huoltajasuhdemuutokset", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$.*")
    public Set<String> getHuoltajaSuhdeMuutokset(
            @ApiParam(value = "vvvv-kk-pp", required = true) @RequestParam("startdate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @ApiParam(value = "vvvv-kk-pp", required = true) @RequestParam("enddate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.getHuoltajaSuhdeMuutokset(
                start,
                end
        );
    }

    @ApiOperation(value = "Hakee huoltajasuhteiden muutokset annetusta päivämäärästä aikajärjestyksessä",
            notes = "Sivutusta käytettäessä OID:t eivät välttämättä ole aikajärjestyksessä. Palauttaa maksimissaan 10000 OID:a.")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/huoltajasuhdemuutokset/alkaen/{at}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$.*")
    public List<String> getHuoltajaSuhdeMuutokset(
            @PathVariable DateTime at,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) Integer amount,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.getHuoltajaSuhdeMuutokset(
                at,
                amount,
                offset
        );
    }

    @Generated
    @Getter
    @AllArgsConstructor
    static class ExistenceCheckResult {
        private final String oid;
    }
}
