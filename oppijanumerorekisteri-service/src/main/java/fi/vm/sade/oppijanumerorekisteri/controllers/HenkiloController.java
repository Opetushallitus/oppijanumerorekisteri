package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnauthorizedException;
import fi.vm.sade.oppijanumerorekisteri.filter.AuditLogRead;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Generated;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.joda.time.DateTime;
import org.springframework.core.env.Environment;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.*;

@Tag(name = "Henkilot")
@RestController
@RequestMapping("/henkilo")
@Validated
@RequiredArgsConstructor
@Slf4j
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
    @Hidden
    @Operation(summary = "Hakee henkilöiden perustiedot annetuilla hakukriteereillä", description = "Korvaava rajapinta: POST /kayttooikeus-service/virkailija/haku")
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
    @Operation(summary = "Hakee henkilön hakutermin perusteella.", description = "Hakutermillä haetaan henkilön nimen, henkilötunnuksen ja OID:n mukaan."
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
    @Operation(summary = "Hakee henkilöiden OID:t yhteystiedon perusteella.")
    public Iterable<String> getByYhteystieto(@PathVariable String arvo) {
        return henkiloService.listOidByYhteystieto(arvo);
    }

    @PostMapping("/yhteystiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @Operation(summary = "Hakee henkilöiden perustiedot sekä yhteystiedot annetuilla hakukriteereillä")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public Iterable<HenkiloYhteystiedotDto> getYhteystiedot(@RequestBody HenkiloCriteria criteria) {
        return henkiloService.listWithYhteystiedotAsAdmin(criteria);
    }

    @Operation(summary = "Palauttaa tiedon, onko kirjautuneella käyttäjällä henkilötunnus järjestelmässä")
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/current/hasHetu", method = RequestMethod.GET)
    public Boolean hasHetu() {
        // get oid from security context
        return henkiloService.getHasHetu();
    }

    @Operation(summary = "Hakee henkilön OID:n, HeTu:n ja nimet henkilötunnuksen perusteella")
    @ApiResponses(value = { @ApiResponse(responseCode = "404", description = "Not Found") })
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/henkiloPerusByHetu/{hetu}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloOidHetuNimiDto henkiloOidHetuNimiByHetu(@PathVariable String hetu) {
        return this.henkiloService.getHenkiloOidHetuNimiByHetu(hetu);
    }

    @Operation(summary = "Hakee annetun henkilö OID listaa vastaavien henkilöiden perustiedot. Rajapinnasta saa hakea enintään 5000 henkilön tietoja kerralla.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/henkiloPerustietosByHenkiloOidList", method = RequestMethod.POST)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(
            @Parameter(description = "Format: [\"oid1\", ...]") @RequestBody List<String> henkiloOids) {
        List<HenkiloPerustietoDto> henkiloPerustietoDtos = this.henkiloService
                .getHenkiloPerustietoByOids(henkiloOids);
        Boolean permissionCheckDisabled = environment.getProperty(
                "oppijanumerorekisteri.disable-strict-permission-check", Boolean.class, false);
        if (Boolean.TRUE.equals(permissionCheckDisabled)) {
            return henkiloPerustietoDtos;
        }
        return this.permissionChecker.filterUnpermittedHenkiloPerustieto(henkiloPerustietoDtos,
                Collections.singletonMap(PALVELU_OPPIJANUMEROREKISTERI,
                        Collections.singletonList(KAYTTOOIKEUS_HENKILON_RU)),
                null);
    }

    @Operation(summary = "Henkilötietojen päivitys", description = "Päivittää kutsussa annetuun OID:n täsmäävän henkilön tiedot")
    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#henkiloUpdateDto.oidHenkilo, {'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}, 'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public String updateHenkilo(@RequestBody @Validated HenkiloUpdateDto henkiloUpdateDto,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloModificationService.updateHenkilo(henkiloUpdateDto).getOidHenkilo();
    }

    @Operation(summary = "Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getAllHenkiloYhteystiedot(
            @PathVariable("oid") String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @Operation(summary = "Hakee annetun henkilön yhteystietoryhmän yhteystiedot")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot/{tyyppi}", method = RequestMethod.GET)
    public YhteystiedotDto getHenkiloYhteystiedot(@Parameter(description = "Henkilön OID") @PathVariable("oid") String oid,
            @Parameter(description = "Koodisto \"yhteystietotyypit\"") @PathVariable("tyyppi") String tyyppi,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getHenkiloYhteystiedot(oid, tyyppi)
                .orElseThrow(() -> new NotFoundException("Yhteystiedot not found by tyyppi=" + tyyppi));
    }

    @Operation(summary = "Henkilön haku OID:n perusteella.", description = "Hakee henkilön tiedot annetun OID:n pohjalta, sisältään kaikki henkilön tiedot.")
    @ApiResponses(value = { @ApiResponse(responseCode = "404", description = "Not Found") })
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloDto findByOid(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getHenkilosByOids(Collections.singletonList(oid))
                .stream().findFirst().orElseThrow(NotFoundException::new);
    }

    @Operation(summary = "Palauttaa, onko annettu henkilö OID järjestelmässä", description = "Jos henkilö löytyy, palautuu ok (200), muuten not found (404)")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @ApiResponses(value = { @ApiResponse(responseCode = "404", description = "Not Found") })
    @RequestMapping(value = "/{oid}", method = RequestMethod.HEAD)
    public ResponseEntity<Object> oidExists(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        if (this.henkiloService.getOidExists(oid)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/{oid}", method = RequestMethod.DELETE)
    @Operation(summary = "Passivoi henkilön mukaanlukien käyttöoikeudet ja organisaatiot.", description = "Asettaa henkilön passivoiduksi, henkilön tietoja ei poisteta.")
    public void passivateHenkilo(@Parameter(description = "Henkilön OID") @PathVariable("oid") String oid) {
        this.henkiloModificationService.disableHenkilo(oid);
    }

    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @DeleteMapping(path = "/{oid}/access")
    @Operation(summary = "Poistaa henkilön käyttäjätunnuksen, käyttöoikeudet ja organisaatiot sekä työyhteystiedot.")
    public void removeAccessRights(@Parameter(description = "Henkilön OID") @PathVariable("oid") String oid) {
        henkiloModificationService.removeAccessRights(oid);
    }

    @Operation(summary = "Henkilön haku OID:n perusteella.", description = "Palauttaa henkilön master version jos annettu OID on duplikaatin henkilön slave versio.")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/master", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloReadDto getMasterByOid(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getMasterByOid(oid);
    }

    @Operation(summary = "Henkilön haku henkilötunnuksen perusteella.")
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @RequestMapping(value = "/hetu={hetu}", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloReadDto getByHetu(@PathVariable String hetu,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return henkiloService.getByHetu(hetu);
    }

    @Operation(summary = "Henkilö luonti", description = "Luo uuden henkilön annetun henkilö DTO:n pohjalta.")
    @ApiResponses(value = { @ApiResponse(responseCode = "400", description = "bad input") })
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', " +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI')")
    @ResponseStatus(HttpStatus.CREATED)
    @RequestMapping(value = "", method = RequestMethod.POST)
    public String createHenkiloFromHenkiloCreateDto(
            @Parameter(description = "Henkilön sukupuolen kelvolliset arvot löytyvät sukupuoli koodistosta.") @RequestBody @Validated HenkiloCreateDto henkilo) {
        return this.henkiloModificationService.createAndYksiloiHenkilo(henkilo).getOidHenkilo();
    }

    @Operation(summary = "Henkilön olemassaolon tarkistus", description = "Tarkistaa henkilön olemassa olon annetun syötteen pohjalta.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Henkilölle löytyi oppijanumero",content = @Content(mediaType = "application/json", schema = @Schema(implementation = ExistenceCheckResult.class))),
            @ApiResponse(responseCode = "204", description = "Henkilö on olemassa muttei oppijanumerorekisterissä"),
            @ApiResponse(responseCode = "400", description = "Viallinen syöte"),
            @ApiResponse(responseCode = "404", description = "Henkilöä ei löydy annetuin tiedoin"),
            @ApiResponse(responseCode = "409", description = "Henkilön tiedot virheelliset"),
    })
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', " +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI')")
    @PostMapping(value = "/exists")
    public ResponseEntity<ExistenceCheckResult> existenceCheck(
            @Parameter(description = "Henkilön yksilöivät tiedot.") @RequestBody @Validated HenkiloExistenceCheckDto details) {
        Optional<String> oid = yksilointiService.exists(details);
        return oid.isPresent() ? new ResponseEntity<>(new ExistenceCheckResult(oid.get()), HttpStatus.OK)
                : ResponseEntity.noContent().build();
    }

    @Operation(summary = "Henkilöiden haku OID:ien perusteella.", description = "Hakee henkilöiden tiedot annetun OID:ien pohjalta, sisältään kaikkien henkilön kaikki tiedot.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/henkilotByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloDto> findHenkilotByOidList(
            @Parameter(description = "Format: [\"oid1\", ...]") @RequestBody List<String> oids,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService)
            throws IOException {
        return this.permissionChecker.filterUnpermittedHenkilo(
                this.henkiloService.getHenkilosByOids(oids),
                Collections.singletonMap("OPPIJANUMEROREKISTERI", Arrays.asList("READ", "HENKILON_RU")),
                permissionService);
    }

    @Operation(summary = "Henkilöiden master tietojen haku OID:ien perusteella max 5000 kerrallaan.", description = "Hakee henkilöiden master tiedot annetun OID:ien pohjalta max 5000 kerrallaan.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/masterHenkilosByOidList", method = RequestMethod.POST)
    public Map<String, HenkiloDto> masterHenkilosByOidList(
            @Parameter(description = "Format: [\"oid1\", ...]") @RequestBody List<String> oids,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService)
            throws IOException {
        return this.permissionChecker.filterUnpermittedHenkilo(
                this.henkiloService.getMastersByOids(new HashSet(oids)),
                Collections.singletonMap(PALVELU_OPPIJANUMEROREKISTERI,
                        Arrays.asList(KAYTTOOIKEUS_READ, KAYTTOOIKEUS_HENKILON_RU)),
                permissionService);
    }

    @GetMapping("/{oid}/passinumerot")
    @Operation(summary = "Henkilön passinumeroiden haku.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    public Set<String> getPassportNumbers(@PathVariable String oid) {
        return henkiloService.getEntityByOid(oid).getPassinumerot();
    }

    @PostMapping("/{oid}/passinumerot")
    @Operation(summary = "Henkilön passinumeroiden asetus.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    public Set<String> setPassportNumbers(
            @PathVariable String oid,
            @RequestBody @NotNull Set<@NotBlank String> passinumerot) {
        return henkiloService.setPassportNumbers(oid, passinumerot);
    }

    @Operation(summary = "Hakee henkilön tiedot annetun tunnistetiedon avulla.", description = "Hakee henkilön tiedot annetun tunnistetiedon avulla.")
    @ApiResponses(value = { @ApiResponse(responseCode = "404", description = "Not Found") })
    @PostAuthorize("@permissionChecker.isAllowedToReadPerson(returnObject.oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, null)")
    @RequestMapping(value = "/identification", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public HenkiloDto findByIdpAndIdentifier(
            @Parameter(description = "Tunnistetiedon tyyppi", required = true) @RequestParam("idp") IdpEntityId idp,
            @Parameter(description = "Varsinainen tunniste", required = true) @RequestParam("id") String identifier) {
        return this.henkiloService.getHenkiloByIDPAndIdentifier(idp, identifier);
    }

    @GetMapping("/{oid}/identification")
    @Operation(summary = "Henkilön tunnistetietojen haku.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    public Iterable<IdentificationDto> getIdentifications(@PathVariable String oid) {
        return identificationService.listByHenkiloOid(oid);
    }

    @PostMapping("/{oid}/identification")
    @Operation(summary = "Henkilön tunnistetietojen lisääminen.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    public Iterable<IdentificationDto> addIdentification(@PathVariable String oid,
            @RequestBody @Validated IdentificationDto identification) {
        return identificationService.create(oid, identification);
    }

    @DeleteMapping("/{oid}/identification/{idpEntityId}/**")
    @Operation(summary = "Henkilön tunnistetietojen poistaminen")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'ROLE_APP_HENKILONHALLINTA_OPHREKISTERI')")
    public Iterable<IdentificationDto> removeIdentification(@PathVariable String oid,
            @PathVariable IdpEntityId idpEntityId,
            HttpServletRequest request) {
        String requestUrl = request.getRequestURL().toString();
        String identifier = requestUrl.split("identification/" + idpEntityId + "/")[1];
        return identificationService.remove(oid, idpEntityId, identifier);
    }

    @Operation(summary = "Listaa sallitut henkilötyypit henkilöiden luontiin liittyen.", description = "Listaa ne henkilötyypit joita kirjautunt käyttäjä saa luoda henkilöhallintaan.")
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
    @Operation(summary = "Käynnistää henkilön yksilöinnin.", description = "Käynnistää henkilön yksilöintiprosessin VTJ:n suuntaan manuaalisesti.")
    public void yksiloiManuaalisesti(
            @Parameter(description = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {

        this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
    }

    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#henkiloOid, {'OPPIJANUMEROREKISTERI': {'MANUAALINEN_YKSILOINTI'}} , #permissionService )")
    @RequestMapping(value = "/{oid}/yksiloihetuton", method = RequestMethod.POST)
    @Operation(summary = "Yksilöi hetuttoman henkilön.", description = "Yksilöi hetuttoman henkilön.")
    public void yksiloiHetuton(
            @Parameter(description = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.yksilointiService.hetuttomanYksilointi(henkiloOid);
    }

    @PreAuthorize("@permissionChecker.isSuperUser()")
    @RequestMapping(value = "/{oid}/purayksilointi", method = RequestMethod.POST)
    @Operation(summary = "Henkilön yksilöinnin purku.", description = "Purkaa hetuttoman henkilön yksilöinnin")
    public void puraYksilointi(
            @Parameter(description = "Henkilön OID", required = true) @PathVariable("oid") String henkiloOid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        this.yksilointiService.puraHeikkoYksilointi(henkiloOid);
    }

    @PutMapping("/{oid}/yksilointitiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @Operation(summary = "Päivittään yksilöidyn henkilön tiedot VTJ:stä")
    public void paivitaYksilointitiedot(@PathVariable String oid) {
        try {
            yksilointiService.paivitaYksilointitiedot(oid);
        } catch (ObjectOptimisticLockingFailureException e) {
            log.error("Optimistic locking failed for " + e.getPersistentClassName() + " with identifier " + e.getIdentifier());
            throw e;
        }
    }

    @GetMapping("/{oid}/yksilointitiedot")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @Operation(summary = "Hakee henkilön yksilöintitiedot oidin perusteella")
    public YksilointitietoDto getYksilointitiedot(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return yksilointiService.getYksilointiTiedot(oid);
    }

    @PutMapping("/{oid}/yksilointitiedot/yliajayksiloimaton")
    @PreAuthorize("@permissionChecker.isAllowedToModifyPerson(#oid, {'OPPIJANUMEROREKISTERI': {'VTJ_VERTAILUNAKYMA'}}, #permissionService)")
    @Operation(summary = "Yliajaa henkilön tiedot yksilöintitiedoilla. Tarkoitettu henkilöille, joiden VTJ-yksilöinti on epäonnistunut")
    public void yliajaHenkilonTiedot(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        yksilointiService.yliajaHenkilonTiedot(oid);
    }

    @GetMapping("/yksilointitiedot")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @Operation(summary = "Hakee epäonnistuneet yksilöinnit")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public Page<YksilointiVertailuDto> listYksilointitiedot(
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count) {
        return yksilointiService.listEpaonnistunutYksilointi(page, count);
    }

    @GetMapping("/{oid}/slaves")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}}, #permissionService)")
    @Operation(summary = "Hakee henkilön duplikaatit oidin perusteella")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloReadDto> findSlavesByMasterOid(
            @PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.findSlavesByMasterOid(oid);
    }

    @GetMapping("/{oid}/duplicates")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'DUPLIKAATTINAKYMA'}}, #permissionService)")
    @Operation(summary = "Hakee henkilon duplikaatit nimeä vertailemalla")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloDuplicateDto> findDuplicates(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.duplicateService.findDuplicates(oid);
    }

    @GetMapping("/{oid}/hakemukset")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'DUPLIKAATTINAKYMA'}}, #permissionService)")
    @Operation(summary = "Hakee henkilön hakemukset haku-app:sta ja atarusta mukaanlukien henkilöön linkitettyjen duplikaattien hakemukset.")
    public List<HakemusDto> getApplications(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.duplicateService.getApplications(oid);
    }

    @GetMapping("/duplikaatit")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @Operation(summary = "Hakee duplikaatit nimeä vertailemalla")
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloDuplicateDto> getDuplikaatit(
            @RequestParam String etunimet,
            @RequestParam String kutsumanimi,
            @RequestParam String sukunimi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate syntymaaika) {
        HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(etunimet, kutsumanimi, sukunimi,
                syntymaaika);
        return this.duplicateService.getDuplikaatit(criteria);
    }

    private void checkLinkPermission(String main, List<String> duplicates, String permission,
            ExternalPermissionService permissionService) {
        Map<String, List<String>> allowedPalveluRooli = Map.of("OPPIJANUMEROREKISTERI", List.of(permission));
        try {
            if (duplicates.size() == 1) {
                if (!permissionChecker.isAllowedToModifyPerson(main, allowedPalveluRooli,
                        permissionService) &&
                        !permissionChecker.isAllowedToModifyPerson(duplicates.get(0),
                                allowedPalveluRooli, permissionService)) {
                    throw new UnauthorizedException();
                }
            } else {
                if (!permissionChecker.isAllowedToModifyPerson(main, allowedPalveluRooli,
                        permissionService)) {
                    throw new UnauthorizedException();
                }
            }
        } catch (IOException e) {
            throw new UnauthorizedException();
        }
    }

    @PostMapping("/{oid}/link")
    @Operation(summary = "Linkittää henkilöön annetun joukon duplikaatteja")
    public List<String> linkDuplicates(@PathVariable String oid, @RequestBody List<String> duplicates,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        checkLinkPermission(oid, duplicates, "DUPLIKAATTINAKYMA", permissionService);
        return this.henkiloModificationService.linkHenkilos(oid, duplicates);
    }

    @PostMapping("/{oid}/forcelink")
    @Operation(summary = "Linkittää henkilöön annetun joukon duplikaatteja. purkaa duplikaattien yksilöinnin tarvittaessa")
    public List<String> forceLinkDuplicates(@PathVariable String oid, @RequestBody List<String> duplicates,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        checkLinkPermission(oid, duplicates, "YKSILOINNIN_PURKU", permissionService);
        return this.henkiloModificationService.forceLinkHenkilos(oid, duplicates);
    }

    @DeleteMapping("/{oid}/unlink/{slaveOid}")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @Operation(summary = "Poistaa henkilöltä linkityksen toiseen henkilöön")
    public void unlinkHenkilo(@PathVariable String oid, @PathVariable String slaveOid) {
        this.henkiloModificationService.unlinkHenkilo(oid, slaveOid);
    }

    @Operation(summary = "Hae käyttäjän asiointikieli tai jos ei ole asetettu oletuksena suomi")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oidHenkilo, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oidHenkilo}/asiointiKieli", method = RequestMethod.GET)
    public String getAsiointikieli(@PathVariable String oidHenkilo,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.getAsiointikieli(oidHenkilo);
    }

    @Operation(summary = "Hae kirjautuneen käyttäjän asiointikieli tai jos ei ole asetettu oletuksena suomi")
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/current/asiointiKieli", method = RequestMethod.GET)
    public String getCurrentUserAsiointikieli() {
        return this.henkiloService.getCurrentUserAsiointikieli();
    }

    @Operation(summary = "Hae kirjautuneen käyttäjän omat tiedot. Asiointikieleksi annetaan suomi jos ei asetettu.")
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/current/omattiedot", method = RequestMethod.GET)
    public HenkiloOmattiedotDto getCurrentUserOmatTiedot() {
        return this.henkiloService.getOmatTiedot();
    }

    @Operation(summary = "Hae käyttäjän omat tiedot. Asiointikieleksi annetaan suomi jos ei asetettu.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ')")
    @RequestMapping(value = "/{oidHenkilo}/omattiedot", method = RequestMethod.GET)
    public HenkiloOmattiedotDto getUserOmatTiedot(@PathVariable String oidHenkilo) {
        return this.henkiloService.getOmatTiedot(oidHenkilo);
    }

    @Operation(summary = "Hakee annetun henkilötunnus-listaa vastaavien henkilöiden perustiedot. Rajapinnasta saa hakea enintään 5000 henkilön tietoja kerralla.")
    @PreAuthorize("hasAnyRole('ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'ROLE_APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'ROLE_APP_OPPIJANUMEROREKISTERI_HENKILON_RU')")
    @RequestMapping(value = "/henkiloPerustietosByHenkiloHetuList", method = RequestMethod.POST)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HenkiloPerustietoDto> henkilotByHenkiloHetuList(
            @Parameter(description = "Format: [\"hetu1\", ...]") @RequestBody List<String> henkiloHetus,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        List<HenkiloPerustietoDto> henkiloPerustietoDtos = this.henkiloService
                .getHenkiloPerustietoByHetus(henkiloHetus);
        return this.permissionChecker.filterUnpermittedHenkiloPerustieto(henkiloPerustietoDtos,
                Collections.singletonMap(PALVELU_OPPIJANUMEROREKISTERI,
                        Collections.singletonList(KAYTTOOIKEUS_HENKILON_RU)),
                permissionService);
    }

    @Operation(summary = "Hae käyttäjän huoltajat oidin perusteella")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/{oid}/huoltajat", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$..oidHenkilo")
    public List<HuoltajaDto> getHenkiloHuoltajat(@PathVariable String oid,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.getHenkiloHuoltajat(oid);
    }

    @Operation(summary = "Hae huoltajasuhteiden muutokset tietyltä aikaväliltä")
    @PreAuthorize("@permissionChecker.isAllowedToReadPerson(#oid, {'OPPIJANUMEROREKISTERI': {'READ', 'HENKILON_RU'}, 'KAYTTOOIKEUS': {'PALVELUKAYTTAJA_CRUD'}}, #permissionService)")
    @RequestMapping(value = "/huoltajasuhdemuutokset", method = RequestMethod.GET)
    @AuditLogRead(jsonPath = "$.*")
    public Set<String> getHuoltajaSuhdeMuutokset(
            @Parameter(description = "vvvv-kk-pp", required = true) @RequestParam("startdate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @Parameter(description = "vvvv-kk-pp", required = true) @RequestParam("enddate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestHeader(value = "External-Permission-Service", required = false) ExternalPermissionService permissionService) {
        return this.henkiloService.getHuoltajaSuhdeMuutokset(
                start,
                end);
    }

    @Operation(summary = "Hakee huoltajasuhteiden muutokset annetusta päivämäärästä aikajärjestyksessä", description = "Sivutusta käytettäessä OID:t eivät välttämättä ole aikajärjestyksessä. Palauttaa maksimissaan 10000 OID:a.")
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
                offset);
    }

    @Generated
    @Getter
    @AllArgsConstructor
    static class ExistenceCheckResult {
        private final String oid;
    }
}
