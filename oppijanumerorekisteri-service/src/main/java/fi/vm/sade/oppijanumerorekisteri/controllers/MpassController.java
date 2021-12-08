package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.HttpURLConnection;
import java.util.Collection;

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
@RestController
@RequestMapping(MpassController.REQUEST_MAPPING)
@RequiredArgsConstructor
@Validated
public class MpassController {

    protected static final String REQUEST_MAPPING = "/mpass";
    private static final SimpleBeanPropertyFilter mpassFilter = SimpleBeanPropertyFilter.filterOutAllExcept("oid", "oppijanumero");
    private static final FilterProvider filterProvider = new SimpleFilterProvider().addFilter("mpassFilter", mpassFilter);
    private final OppijaService oppijaService;

    @PutMapping
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Useamman oppijan luonti",
            notes = "Käynnistää oppijoiden luonnin tausta-ajona, jonka tilaa voi seurata palautettavan tuonnin id:n avulla. Lisää automaattisesti oppijat käyttäjän organisaatioihin.")
    public OppijaTuontiPerustiedotReadDto create(@Valid @RequestBody OppijaTuontiCreateDto dto) {
        return oppijaService.create(dto);
    }

    @GetMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin kaikki tiedot",
            notes = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat")
    @ApiResponses(value = {@ApiResponse(code = HttpURLConnection.HTTP_OK,
            message = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat",
            response = FilteredResult.class)})
    public MappingJacksonValue getOppijatByTuontiId(@PathVariable Long id) {

        OppijaTuontiReadDto result = oppijaService.getOppijatByTuontiId(id);

        MappingJacksonValue filtered = new MappingJacksonValue(result);
        filtered.setFilters(filterProvider);

        return filtered;
    }

    @PostMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Käynnistää oppijoiden tuonnin käsittelyn",
            notes = "Tarvitaan vain jos oppijoiden tuonnin automaattinen käsittely on keskeytynyt syystä tai toisesta.")
    public OppijaTuontiPerustiedotReadDto create(@PathVariable Long id) {
        return oppijaService.create(id);
    }

    @GetMapping("/tuonti={id}/perustiedot")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',''," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin perustiedot",
            notes = "Tämän avulla voi seurata oppijoiden tuonnin edistymistä.")
    public OppijaTuontiPerustiedotReadDto getTuontiById(@PathVariable Long id) {
        return oppijaService.getTuontiById(id);
    }

    // Following is just for swagger documentation
    @Getter
    static class FilteredResult {
        private long id;
        private int kasiteltavia;
        private int kasiteltyja;
        private boolean kasitelty;
        private Collection<FilteredRow> henkilot;
    }

    @Getter
    static class FilteredRow {
        private String tunniste;
        private FilteredStudent henkilo;
    }

    @Getter
    static class FilteredStudent {
        private String oid;
        private String oppijanumero;
    }
}
