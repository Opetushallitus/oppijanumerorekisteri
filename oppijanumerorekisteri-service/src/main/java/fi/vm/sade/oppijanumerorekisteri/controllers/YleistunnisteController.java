package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.Generated;
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
@Api(tags = "Yleistunniste - Oppijanumeron käyttö yleistunnisteena")
@RestController
@RequestMapping(YleistunnisteController.REQUEST_MAPPING)
@RequiredArgsConstructor
@Validated
public class YleistunnisteController {

    protected static final String REQUEST_MAPPING = "/yleistunniste";
    protected static final String ACCESS_RIGHT = "YLEISTUNNISTE_LUONTI";
    protected static final String ACCESS_RIGHT_CHECK = "hasAnyRole('" + ACCESS_RIGHT + "')";

    private static final SimpleBeanPropertyFilter yleistunnisteFilter = SimpleBeanPropertyFilter.filterOutAllExcept("oid", "oppijanumero");
    private static final FilterProvider filterProvider = new SimpleFilterProvider().addFilter("yleistunnisteFilter", yleistunnisteFilter);
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
    public MappingJacksonValue getOppijatByTuontiId(@PathVariable Long id) {

        OppijaTuontiReadDto result = oppijaService.getOppijatByTuontiId(id);

        MappingJacksonValue filtered = new MappingJacksonValue(result);
        filtered.setFilters(filterProvider);

        return filtered;
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

    // Following is just for swagger documentation
    @Generated
    @Getter
    static class FilteredResult {
        private long id;
        private int kasiteltavia;
        private int kasiteltyja;
        private boolean kasitelty;
        private Collection<FilteredRow> henkilot;
    }

    @Generated
    @Getter
    static class FilteredRow {
        private String tunniste;
        private FilteredStudent henkilo;
    }

    @Generated
    @Getter
    static class FilteredStudent {
        private String oid;
        private String oppijanumero;
    }
}
