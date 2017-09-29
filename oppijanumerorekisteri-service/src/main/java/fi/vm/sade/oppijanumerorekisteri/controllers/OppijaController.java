package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiYhteenvetoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.ApiOperation;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oppija")
@RequiredArgsConstructor
@Validated
public class OppijaController {

    private final OppijaService oppijaService;

    @PutMapping
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonti eräajona")
    public OppijatReadDto getOrCreate(@Valid @RequestBody OppijatCreateDto dto) {
        return oppijaService.getOrCreate(dto);
    }

    @GetMapping("/tuonti={id}")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden haku eräajon ID:llä")
    public OppijatReadDto getByTuontiId(@PathVariable Long id) {
        return oppijaService.getByTuontiId(id);
    }

    @GetMapping("/yhteenveto")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden tuonnin yhteenveto")
    public OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria) {
        return oppijaService.getYhteenveto(criteria);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Oppijoiden haku")
    public Page<OppijaReadDto.HenkiloReadDto> list(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count) {
        return oppijaService.list(criteria, page, count);
    }

    @GetMapping("/oid")
    @PreAuthorize("hasAnyRole('APP_HENKILONHALLINTA_OPHREKISTERI',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @ApiOperation(value = "Muuttuneiden oppijoiden haku")
    public Iterable<String> listOidsBy(OppijaTuontiCriteria criteria) {
        return oppijaService.listOidsBy(criteria);
    }

    @PutMapping("/{henkiloOid}/organisaatio/{organisaatioOid}")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Lisää oppijan organisaatioon")
    public void addOrganisaatio(@PathVariable String henkiloOid, @PathVariable String organisaatioOid) {
        oppijaService.addOrganisaatio(henkiloOid, organisaatioOid);
    }

    @DeleteMapping("/{henkiloOid}/organisaatio/{organisaatioOid}")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Poistaa oppijan organisaatiosta")
    public void deleteOrganisaatio(@PathVariable String henkiloOid, @PathVariable String organisaatioOid) {
        oppijaService.deleteOrganisaatio(henkiloOid, organisaatioOid);
    }

}
