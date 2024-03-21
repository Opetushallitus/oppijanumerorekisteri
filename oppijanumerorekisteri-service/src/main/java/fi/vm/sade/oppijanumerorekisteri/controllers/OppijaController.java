package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Oppijoiden tuontiin liittyvät toiminnot. Oppijoita tuodaan
 * oppijanumerorekisteriin eri oppilashallintojärjestelmistä ja nämä rajapinnat
 * ovat ensisijaisesti heitä varten.
 */
@RestController
@RequestMapping("/oppija")
@RequiredArgsConstructor
@Validated
public class OppijaController {

    private final OppijaService oppijaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Yksittäisen oppijan luonti",
            authorizations = @Authorization("onr"),
            notes = "Lisää automaattisesti oppijan käyttäjän organisaatioihin.")
    public String create(@Valid @RequestBody OppijaCreateDto dto) {
        return oppijaService.create(dto);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Useamman oppijan luonti",
            authorizations = @Authorization("onr"),
            notes = "Käynnistää oppijoiden luonnin tausta-ajona, jonka tilaa voi seurata palautettavan tuonnin id:n avulla. Lisää automaattisesti oppijat käyttäjän organisaatioihin.")
    public OppijaTuontiPerustiedotReadDto create(@Valid @RequestBody OppijaTuontiCreateDto dto) {
        return oppijaService.create(dto, TuontiApi.OPPIJA);
    }

    @GetMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin kaikki tiedot",
            authorizations = @Authorization("onr"),
            notes = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat")
    public OppijaTuontiReadDto getOppijatByTuontiId(@PathVariable Long id) {
        return oppijaService.getOppijatByTuontiId(id);
    }

    @PostMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Käynnistää oppijoiden tuonnin käsittelyn",
            authorizations = @Authorization("onr"),
            notes = "Tarvitaan vain jos oppijoiden tuonnin automaattinen käsittely on keskeytynyt syystä tai toisesta.")
    public OppijaTuontiPerustiedotReadDto create(@PathVariable Long id) {
        return oppijaService.create(id, TuontiApi.OPPIJA);
    }

    @GetMapping("/tuonti={id}/perustiedot")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',''," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin perustiedot",
            authorizations = @Authorization("onr"),
            notes = "Tämän avulla voi seurata oppijoiden tuonnin edistymistä.")
    public OppijaTuontiPerustiedotReadDto getTuontiById(@PathVariable Long id) {
        return oppijaService.getTuontiById(id);
    }

    @GetMapping("/yhteenveto")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin yhteenveto", authorizations = @Authorization("onr"))
    public OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria) {
        return oppijaService.getYhteenveto(criteria);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuontien virheet", authorizations = @Authorization("onr"))
    public Page<OppijaListDto> list(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count,
            @RequestParam(required = false, defaultValue = "CREATED") OppijaTuontiSortKey sortKey,
            @RequestParam(required = false, defaultValue = "ASC") Sort.Direction sortDirection) {
        criteria.setVainVirheet(true);
        return oppijaService.list(criteria, page, count, sortKey, sortDirection);
    }

    @GetMapping("/tuontikooste")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Kooste oppijoiden tuonneista")
    org.springframework.data.domain.Page<TuontiRepository.TuontiKooste> tuontiKooste(@Valid TuontiKoosteRequest tuontiKoosteRequest) {
        return oppijaService.tuontiKooste(tuontiKoosteRequest.forPage(), tuontiKoosteRequest.getId(), tuontiKoosteRequest.getAuthor());
    }

    @GetMapping("/tuontidata/{tuontiId}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_TUONTIDATA_READ')")
    @ApiOperation(value = "Tuontiin liittyvä tuontidata")
    List<OppijaTuontiRiviCreateDto> tuontiData(@PathVariable final long  tuontiId) {
        return oppijaService.tuontiData(tuontiId).stream()
                .map(this::sanitizeHetu)
                .collect(Collectors.toList());

    }

    private OppijaTuontiRiviCreateDto sanitizeHetu(OppijaTuontiRiviCreateDto dto) {
        if ( dto.getHenkilo().getHetu() != null ) {
            dto.getHenkilo().setHetu(dto.getHenkilo().getHetu().replaceFirst(".{4}$", "****"));
        }
        return dto;
    }

    @GetMapping("/muuttuneet")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Muuttuneiden oppijoiden haku",
            authorizations = @Authorization("onr"),
            notes = "Muuttuneet oppijat listataan vanhimmasta uusimpaan.")
    public Page<MasterHenkiloDto<OppijaReadDto>> getMuuttuneet(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) @Max(10000) int count) {
        return oppijaService.listMastersBy(criteria, page, count);
    }

    @PostMapping("/{henkiloOid}/organisaatio")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation(value = "Lisää nykyisen käyttäjän organisaatiot oppijalle", authorizations = @Authorization("onr"))
    public void addKayttajanOrganisaatiot(@PathVariable String henkiloOid) {
        oppijaService.addKayttajanOrganisaatiot(henkiloOid);
    }

    @PutMapping("/{henkiloOid}/organisaatio/{organisaatioOid}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation(value = "Lisää oppijan organisaatioon", authorizations = @Authorization("onr"))
    public void addOrganisaatio(@PathVariable String henkiloOid, @PathVariable String organisaatioOid) {
        oppijaService.addOrganisaatio(henkiloOid, organisaatioOid);
    }

    @DeleteMapping("/{henkiloOid}/organisaatio/{organisaatioOid}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @ApiOperation(value = "Poistaa oppijan organisaatiosta", authorizations = @Authorization("onr"))
    public void deleteOrganisaatio(@PathVariable String henkiloOid, @PathVariable String organisaatioOid) {
        oppijaService.deleteOrganisaatio(henkiloOid, organisaatioOid);
    }

}
