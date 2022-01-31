package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.Generated;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.HttpURLConnection;
import java.util.Collection;
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
public class YleistunnisteController {

    protected static final String REQUEST_MAPPING = "/yleistunniste";
    private static final String ACCESS_RIGHT_LITERAL = "YLEISTUNNISTE_LUONTI";
    private static final String ACCESS_RIGHT_PREFIX = "APP_OPPIJANUMEROREKISTERI_";
    protected static final String ACCESS_RIGHT = ACCESS_RIGHT_PREFIX + ACCESS_RIGHT_LITERAL;
    protected static final String ACCESS_RIGHT_CHECK = "hasAnyRole('" + ACCESS_RIGHT + "')";

    private final OppijaService oppijaService;

    @PutMapping
    @PreAuthorize(ACCESS_RIGHT_CHECK)
    @ApiOperation(value = "Useamman oppijan luonti",
            notes = "Käynnistää oppijoiden luonnin tausta-ajona, jonka tilaa voi seurata palautettavan tuonnin id:n avulla. Lisää automaattisesti oppijat käyttäjän organisaatioihin.")
    public OppijaTuontiPerustiedotReadDto create(@Valid @RequestBody OppijaTuontiCreateDto dto) {
        return oppijaService.create(dto);
    }

    @GetMapping("/tuonti={id}")
    @PreAuthorize(ACCESS_RIGHT_CHECK)
    @ApiOperation(value = "Oppijoiden tuonnin kaikki tiedot",
            notes = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat")
    @ApiResponses(value = {@ApiResponse(code = HttpURLConnection.HTTP_OK,
            message = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat",
            response = FilteredResult.class)})
    public FilteredResult getOppijatByTuontiId(@PathVariable Long id) {
        return new FilteredResult(oppijaService.getOppijatByTuontiId(id));
    }

    @PostMapping("/tuonti={id}")
    @PreAuthorize(ACCESS_RIGHT_CHECK)
    @ApiOperation(value = "Käynnistää oppijoiden tuonnin käsittelyn",
            notes = "Tarvitaan vain jos oppijoiden tuonnin automaattinen käsittely on keskeytynyt syystä tai toisesta.")
    public OppijaTuontiPerustiedotReadDto create(@PathVariable Long id) {
        return oppijaService.create(id);
    }

    @GetMapping("/tuonti={id}/perustiedot")
    @PreAuthorize(ACCESS_RIGHT_CHECK)
    @ApiOperation(value = "Oppijoiden tuonnin perustiedot",
            notes = "Tämän avulla voi seurata oppijoiden tuonnin edistymistä.")
    public OppijaTuontiPerustiedotReadDto getTuontiById(@PathVariable Long id) {
        return oppijaService.getTuontiById(id);
    }

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
        private final String tunniste;
        private final FilteredStudent henkilo;

        public FilteredRow(OppijaTuontiRiviReadDto dto) {
            tunniste = dto.getTunniste();
            henkilo = new FilteredStudent(dto.getHenkilo());
        }
    }

    @Generated
    @Getter
    static class FilteredStudent {
        private final String oid;
        private final String oppijanumero;

        public FilteredStudent(OppijaReadDto dto) {
            oid = dto.getOid();
            oppijanumero = dto.getOppijanumero();
        }
    }
}
