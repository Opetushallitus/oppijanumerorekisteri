package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
    public OppijaTuontiReadDto getOppijatByTuontiId(@PathVariable Long id) {
        return oppijaService.getOppijatByTuontiId(id);
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
}
