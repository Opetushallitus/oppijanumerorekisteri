package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import fi.vm.sade.oppijanumerorekisteri.services.YleistunnisteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Setter;
import lombok.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Oppijanumeron käyttö yleistunnisteena
 * <p>
 * Oppijoiden tuontiin/luontiin liittyvät toiminnot. Oppijoita tuodaan
 * oppijanumerorekisteriin eri järjestelmistä ja nämä rajapinnat
 * ovat ensisijaisesti näitä toimijoita varten.
 * <p>
 * Sisältää käytännössä identtiset oppijantuontitoiminnot kuin
 * OppijaController sillä erotuksella että vastauksista on poistettu
 * arkaluontoiseksi katsottavaa informaatiota
 */
@Tag(name = "Yleistunniste - Oppijanumeron käyttö yleistunnisteena")
@RestController
@RequestMapping(YleistunnisteController.REQUEST_MAPPING)
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasAnyRole(T(fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl).YLEISTUNNISTE_LUONTI_ACCESS_RIGHT)")
public class YleistunnisteController {

    protected static final String REQUEST_MAPPING = "/yleistunniste";
    private static final String NATIONALITY_CODE = "999"; // e.g. "Unknown"

    private final OppijaService oppijaService;

    private final YleistunnisteService yleistunnisteService;

    @Operation(summary = "OID:n tarkistus",
            description =  "Tarkistaa onko annettu oid oppijanumero vai ei. Palauttaa myös mahdolliset linkitetyt oid:it.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Henkilölle löytyi oppijanumero", content = @Content(schema = @Schema(implementation = FilteredStudent.class))),
            @ApiResponse(responseCode = "404", description = "Henkilöä ei löydy annetuin tiedoin"),
    })
    @GetMapping(value = "/hae/{oid}")
    public FilteredStudent tarkistaOid(@Parameter(description = "Tarkistettava OID")
                                                @PathVariable final String oid) {
        OppijaReadDto person = yleistunnisteService.tarkista(oid);
        oppijaService.decorateHenkilosWithLinkedOids(List.of(person));
        return new FilteredStudent(person);
    }

    @Operation(summary = "Oppijanumeron haku yksittäiselle henkilölle",
            description =  "Hakee tai luo oppijanumeron yksittäiselle henkilölle annetun syötteen pohjalta.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Henkilölle löytyi oppijanumero", content = @Content(schema = @Schema(implementation = HenkiloController.ExistenceCheckResult.class))),
            @ApiResponse(responseCode = "400", description = "Viallinen syöte"),
            @ApiResponse(responseCode = "404", description = "Henkilöä ei löydy annetuin tiedoin"),
            @ApiResponse(responseCode = "409", description = "Henkilön tiedot virheelliset"),
    })
    @PostMapping(value = "/hae")
    public YleistunnisteDto yleistunnisteenHaku(@Parameter(description = "Henkilön yksilöivät tiedot.")
                                                @RequestBody @Validated HenkiloExistenceCheckDto details) {
        return yleistunnisteService.hae(details);
    }

    @PutMapping
    @Operation(summary = "Useamman oppijan luonti",
            description =  "Käynnistää oppijoiden luonnin tausta-ajona, jonka tilaa voi seurata palautettavan tuonnin id:n avulla. Lisää automaattisesti oppijat käyttäjän organisaatioihin.")
    public OppijaTuontiPerustiedotReadDto create(@Valid @RequestBody YleistunnisteInput input) {
        return oppijaService.create(input.mapToDto(), TuontiApi.YLEISTUNNISTE);
    }

    @GetMapping("/tuonti={id}")
    @Operation(summary = "Oppijoiden tuonnin kaikki tiedot",
            description =  "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat")
    @ApiResponses(value = {@ApiResponse(responseCode = "200",
            description = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat",
            content = @Content(schema = @Schema(implementation = FilteredResult.class)))})
    public FilteredResult getOppijatByTuontiId(@PathVariable Long id) {
        return new FilteredResult(oppijaService.getOppijatByTuontiId(id));
    }

    @PostMapping("/tuonti={id}")
    @Operation(summary = "Käynnistää oppijoiden tuonnin käsittelyn",
            description =  "Tarvitaan vain jos oppijoiden tuonnin automaattinen käsittely on keskeytynyt syystä tai toisesta.")
    public OppijaTuontiPerustiedotReadDto create(@PathVariable Long id) {
        return oppijaService.create(id, TuontiApi.YLEISTUNNISTE);
    }

    @GetMapping("/tuonti={id}/perustiedot")
    @Operation(summary = "Oppijoiden tuonnin perustiedot",
            description =  "Tämän avulla voi seurata oppijoiden tuonnin edistymistä.")
    public OppijaTuontiPerustiedotReadDto getTuontiById(@PathVariable Long id) {
        return oppijaService.getTuontiById(id);
    }

    // Custom input format
    @Generated
    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    static class YleistunnisteInput {
        @Email
        @Schema(description = "Sähköposti, johon lähetetään hälytyksiä, kun virkailijalta tarvitaan toimenpiteitä")
        private String sahkoposti;

        @NotNull
        @Size(min = 1)
        @Valid
        private List<YleistunnisteInputRow> henkilot;

        public OppijaTuontiCreateDto mapToDto() {
            OppijaTuontiCreateDto dto = new OppijaTuontiCreateDto();
            dto.setSahkoposti(sahkoposti);
            dto.setHenkilot(henkilot.stream().map(YleistunnisteInputRow::mapToDto).collect(Collectors.toList()));
            return dto;
        }
    }

    @Generated
    @Getter
    @Builder
    @AllArgsConstructor
    static class YleistunnisteInputRow {
        @NotNull
        @NotBlank
        @Schema(description = "Lähdejärjestelmän käyttämä tunniste henkilölle")
        private String tunniste;

        @NotNull
        @Valid
        private HenkiloExistenceCheckDto henkilo;

        public OppijaTuontiRiviCreateDto mapToDto() {
            OppijaTuontiRiviCreateDto dto = new OppijaTuontiRiviCreateDto();
            dto.setTunniste(tunniste);
            dto.setHenkilo(map(henkilo));
            return dto;
        }
    }

    public static OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto map(HenkiloExistenceCheckDto input) {
        OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto dto = new OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto();
        dto.setHetu(input.getHetu());
        dto.setEtunimet(input.getEtunimet());
        dto.setKutsumanimi(input.getKutsumanimi());
        dto.setSukunimi(input.getSukunimi());
        dto.setKansalaisuus(Collections.singleton(new KoodiUpdateDto(NATIONALITY_CODE)));
        return dto;
    }

    // Custom output format
    @Generated
    @Getter
    static class FilteredResult {
        private final long id;
        private final int kasiteltavia;
        private final int kasiteltyja;
        private final boolean kasitelty;
        private final Collection<FilteredRow> henkilot;

        public FilteredResult(OppijaTuontiReadDto dto) {
            id = dto.getId();
            kasiteltavia = dto.getKasiteltavia();
            kasiteltyja = dto.getKasiteltyja();
            kasitelty = dto.isKasitelty();
            henkilot = dto.getHenkilot().stream().map(FilteredRow::new).collect(Collectors.toList());
        }
    }

    @Generated
    @Getter
    static class FilteredRow {
        @Schema(description = "Lähdejärjestelmän käyttämä tunniste henkilölle")
        private final String tunniste;
        private final FilteredStudent henkilo;
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @Schema(description = "Indikoi jos henkilön nimivertailussa on tapahtunut virhe")
        private final Boolean conflict;

        public FilteredRow(OppijaTuontiRiviReadDto dto) {
            tunniste = dto.getTunniste();
            henkilo = new FilteredStudent(dto.getHenkilo());
            conflict = dto.getConflict();
        }
    }

    @Generated
    @Getter
    static class FilteredStudent {
        @Schema(description = "Yksilöivä tunniste jäjestelmässä olevalle henkilölle")
        private final String oid;
        @Schema(description = "Yksilöivä tunniste identiteetille")
        private final String oppijanumero;
        @Schema(description = "Päällä mikäli henkilö on passivoitu järjestelmässä")
        private final boolean passivoitu;
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @Schema(description = "Kaikkien linkitettyjen henkilöiden oid:t (master/slave)")
        private final Set<String> linked;

        public FilteredStudent(OppijaReadDto dto) {
            oid = dto.getOid();
            oppijanumero = dto.getOppijanumero();
            passivoitu = dto.isPassivoitu();
            linked = dto.getLinked();
        }
    }
}
