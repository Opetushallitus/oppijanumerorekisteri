package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import fi.vm.sade.oppijanumerorekisteri.services.YleistunnisteService;
import io.swagger.annotations.*;
import lombok.Setter;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.net.HttpURLConnection;
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
@Api(tags = "Yleistunniste - Oppijanumeron käyttö yleistunnisteena")
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

    @ApiOperation(value = "OID:n tarkistus",
            authorizations = @Authorization("onr"),
            notes = "Tarkistaa onko annettu oid oppijanumero vai ei. Palauttaa myös mahdolliset linkitetyt oid:it.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Henkilölle löytyi oppijanumero", response = FilteredStudent.class),
            @ApiResponse(code = 404, message = "Henkilöä ei löydy annetuin tiedoin"),
    })
    @GetMapping(value = "/hae/{oid}")
    public FilteredStudent tarkistaOid(@ApiParam("Tarkistettava OID")
                                                @PathVariable final String oid) {
        OppijaReadDto person = yleistunnisteService.tarkista(oid);
        oppijaService.decorateHenkilosWithLinkedOids(List.of(person));
        return new FilteredStudent(person);
    }

    @ApiOperation(value = "Oppijanumeron haku yksittäiselle henkilölle",
            authorizations = @Authorization("onr"),
            notes = "Hakee tai luo oppijanumeron yksittäiselle henkilölle annetun syötteen pohjalta.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Henkilölle löytyi oppijanumero", response = HenkiloController.ExistenceCheckResult.class),
            @ApiResponse(code = 400, message = "Viallinen syöte"),
            @ApiResponse(code = 404, message = "Henkilöä ei löydy annetuin tiedoin"),
            @ApiResponse(code = 409, message = "Henkilön tiedot virheelliset"),
    })
    @PostMapping(value = "/hae")
    public YleistunnisteDto yleistunnisteenHaku(@ApiParam("Henkilön yksilöivät tiedot.")
                                                @RequestBody @Validated HenkiloExistenceCheckDto details) {
        return yleistunnisteService.hae(details);
    }

    @PutMapping
    @ApiOperation(value = "Useamman oppijan luonti",
            authorizations = @Authorization("yleistunniste"),
            notes = "Käynnistää oppijoiden luonnin tausta-ajona, jonka tilaa voi seurata palautettavan tuonnin id:n avulla. Lisää automaattisesti oppijat käyttäjän organisaatioihin.")
    public OppijaTuontiPerustiedotReadDto create(@Valid @RequestBody YleistunnisteInput input) {
        return oppijaService.create(input.mapToDto());
    }

    @GetMapping("/tuonti={id}")
    @ApiOperation(value = "Oppijoiden tuonnin kaikki tiedot",
            authorizations = @Authorization("yleistunniste"),
            notes = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat")
    @ApiResponses(value = {@ApiResponse(code = HttpURLConnection.HTTP_OK,
            message = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat",
            response = FilteredResult.class)})
    public FilteredResult getOppijatByTuontiId(@PathVariable Long id) {
        return new FilteredResult(oppijaService.getOppijatByTuontiId(id));
    }

    @PostMapping("/tuonti={id}")
    @ApiOperation(value = "Käynnistää oppijoiden tuonnin käsittelyn",
            authorizations = @Authorization("yleistunniste"),
            notes = "Tarvitaan vain jos oppijoiden tuonnin automaattinen käsittely on keskeytynyt syystä tai toisesta.")
    public OppijaTuontiPerustiedotReadDto create(@PathVariable Long id) {
        return oppijaService.create(id);
    }

    @GetMapping("/tuonti={id}/perustiedot")
    @ApiOperation(value = "Oppijoiden tuonnin perustiedot",
            authorizations = @Authorization("yleistunniste"),
            notes = "Tämän avulla voi seurata oppijoiden tuonnin edistymistä.")
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
        @ApiModelProperty(value = "Sähköposti, johon lähetetään hälytyksiä, kun virkailijalta tarvitaan toimenpiteitä")
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
        @ApiModelProperty("Lähdejärjestelmän käyttämä tunniste henkilölle")
        private String tunniste;

        @NotNull
        @Valid
        private YleistunnisteInputPerson henkilo;

        public OppijaTuontiRiviCreateDto mapToDto() {
            OppijaTuontiRiviCreateDto dto = new OppijaTuontiRiviCreateDto();
            dto.setTunniste(tunniste);
            dto.setHenkilo(henkilo.mapToDto());
            return dto;
        }
    }

    @Generated
    @Getter
    @Setter
    @SuperBuilder
    static class YleistunnisteInputPerson extends HenkiloExistenceCheckDto {

        public YleistunnisteInputPerson() {
            super(null, null, null, null);
        }

        public OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto mapToDto() {
            OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto dto = new OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto();
            dto.setHetu(getHetu());
            dto.setEtunimet(getEtunimet());
            dto.setKutsumanimi(getKutsumanimi());
            dto.setSukunimi(getSukunimi());
            dto.setKansalaisuus(Collections.singleton(new KoodiUpdateDto(NATIONALITY_CODE)));
            return dto;
        }
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
        @ApiModelProperty("Lähdejärjestelmän käyttämä tunniste henkilölle")
        private final String tunniste;
        private final FilteredStudent henkilo;
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @ApiModelProperty("Indikoi jos henkilön nimivertailussa on tapahtunut virhe")
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
        @ApiModelProperty("Yksilöivä tunniste jäjestelmässä olevalle henkilölle")
        private final String oid;
        @ApiModelProperty("Yksilöivä tunniste identiteetille")
        private final String oppijanumero;
        @ApiModelProperty("Päällä mikäli henkilö on passivoitu järjestelmässä")
        private final boolean passivoitu;
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @ApiModelProperty("Kaikkien linkitettyjen henkilöiden oid:t (master/slave)")
        private final Set<String> linked;

        public FilteredStudent(OppijaReadDto dto) {
            oid = dto.getOid();
            oppijanumero = dto.getOppijanumero();
            passivoitu = dto.isPassivoitu();
            linked = dto.getLinked();
        }
    }
}
