package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaListDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiSortKey;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Hidden
@RestController
@RequestMapping("/internal/oppijoidentuonti")
@RequiredArgsConstructor
public class UiController {
    private final OppijaService oppijaService;

    @GetMapping("/virheet")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    @Operation(summary = "Oppijoiden tuontien virheet")
    public Page<OppijaListDto> oppijoidenTuontienVirheet(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count,
            @RequestParam(required = false, defaultValue = "CREATED") OppijaTuontiSortKey sortKey,
            @RequestParam(required = false, defaultValue = "ASC") Sort.Direction sortDirection) {
        return oppijaService.oppijoidenTuontienVirheet(criteria, page, count, sortKey, sortDirection);
    }
}
