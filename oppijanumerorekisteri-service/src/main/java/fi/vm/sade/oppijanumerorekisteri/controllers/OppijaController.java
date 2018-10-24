package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.ApiOperation;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Yksittäisen oppijan luonti",
            notes = "Lisää automaattisesti oppijan käyttäjän organisaatioihin.")
    public String create(@Valid @RequestBody OppijaCreateDto dto) {
        return oppijaService.create(dto);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Useamman oppijan luonti",
            notes = "Käynnistää oppijoiden luonnin tausta-ajona, jonka tilaa voi seurata palautettavan tuonnin id:n avulla. Lisää automaattisesti oppijat käyttäjän organisaatioihin.")
    public OppijaTuontiPerustiedotReadDto create(@Valid @RequestBody OppijaTuontiCreateDto dto) {
        return oppijaService.create(dto);
    }

    @GetMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin kaikki tiedot",
            notes = "Perustietojen lisäksi palauttaa tuontiin liittyvät oppijat")
    public OppijaTuontiReadDto getOppijatByTuontiId(@PathVariable Long id) {
        return oppijaService.getOppijatByTuontiId(id);
    }

    @PostMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Käynnistää oppijoiden tuonnin käsittelyn",
            notes = "Tarvitaan vain jos oppijoiden tuonnin automaattinen käsittely on keskeytynyt syystä tai toisesta.")
    public OppijaTuontiPerustiedotReadDto create(@PathVariable Long id) {
        return oppijaService.create(id);
    }

    @GetMapping("/tuonti={id}/perustiedot")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin perustiedot",
            notes = "Tämän avulla voi seurata oppijoiden tuonnin edistymistä.")
    public OppijaTuontiPerustiedotReadDto getTuontiById(@PathVariable Long id) {
        return oppijaService.getTuontiById(id);
    }

    @GetMapping("/yhteenveto")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin yhteenveto")
    public OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria) {
        return oppijaService.getYhteenveto(criteria);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden haku")
    public Page<OppijaListDto> list(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count,
            @RequestParam(required = false, defaultValue = "CREATED") OppijaTuontiSortKey sortKey,
            @RequestParam(required = false, defaultValue = "ASC") Sort.Direction sortDirection) {
        return oppijaService.list(criteria, page, count, sortKey, sortDirection);
    }

    @GetMapping("/muuttuneet")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Muuttuneiden oppijoiden haku",
            notes = "Muuttuneet oppijat listataan vanhimmasta uusimpaan.")
    public Page<MasterHenkiloDto<OppijaReadDto>> getMuuttuneet(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) @Max(10000) int count) {
        return oppijaService.listMastersBy(criteria, page, count);
    }

    @PostMapping("/{henkiloOid}/organisaatio")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Lisää nykyisen käyttäjän organisaatiot oppijalle")
    public void addKayttajanOrganisaatiot(@PathVariable String henkiloOid) {
        oppijaService.addKayttajanOrganisaatiot(henkiloOid);
    }

    @PutMapping("/{henkiloOid}/organisaatio/{organisaatioOid}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Lisää oppijan organisaatioon")
    public void addOrganisaatio(@PathVariable String henkiloOid, @PathVariable String organisaatioOid) {
        oppijaService.addOrganisaatio(henkiloOid, organisaatioOid);
    }

    @DeleteMapping("/{henkiloOid}/organisaatio/{organisaatioOid}")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Poistaa oppijan organisaatiosta")
    public void deleteOrganisaatio(@PathVariable String henkiloOid, @PathVariable String organisaatioOid) {
        oppijaService.deleteOrganisaatio(henkiloOid, organisaatioOid);
    }

}
