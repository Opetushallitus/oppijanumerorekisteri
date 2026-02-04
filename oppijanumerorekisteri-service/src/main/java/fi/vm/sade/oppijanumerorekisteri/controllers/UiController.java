package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaListDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijahakuCriteria;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijahakuResult;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

import org.springframework.data.web.PagedModel;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Hidden
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class UiController {
    private final OppijaService oppijaService;

    @GetMapping("/oppijoidentuonti/virheet")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA'," +
            "'APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',"
            + "'APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI')")
    public Page<OppijaListDto> oppijoidenTuontienVirheet(
            OppijaTuontiCriteria criteria,
            @RequestParam(required = false, defaultValue = "1") @Min(1) int page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) int count) {
        return oppijaService.oppijoidenTuontienVirheet(criteria, page, count);
    }

    @PostMapping("/oppijahaku")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001')")
    public PagedModel<OppijahakuResult> oppijahaku(@Valid @RequestBody OppijahakuCriteria criteria) {
        return new PagedModel<>(oppijaService.oppijahaku(criteria));
    }
}
