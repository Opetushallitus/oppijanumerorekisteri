package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.annotations.ApiOperation;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oppija")
@RequiredArgsConstructor
public class OppijaController {

    private final OppijaService oppijaService;

    @PutMapping
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Oppijoiden tuonti eräajona")
    public OppijatReadDto getOrCreate(@Valid @RequestBody OppijatCreateDto dto) {
        return oppijaService.getOrCreate(dto);
    }

    @GetMapping("/tuonti={id}")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Oppijoiden haku eräajon ID:llä")
    public OppijatReadDto getByTuontiId(@PathVariable Long id) {
        return oppijaService.getByTuontiId(id);
    }

    @GetMapping("/oid")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @ApiOperation(value = "Muuttuneiden oppijoiden haku")
    public Iterable<String> listOidsBy(OppijaTuontiCriteria criteria) {
        return oppijaService.listOidsBy(criteria);
    }

}
