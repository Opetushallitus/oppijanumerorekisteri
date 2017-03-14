package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/koodisto")
public class KoodistoController {

    private final KoodistoService koodistoService;

    public KoodistoController(KoodistoService koodistoService) {
        this.koodistoService = koodistoService;
    }

    @GetMapping("/{koodisto}")
    public Iterable<KoodiType> listKoodit(@PathVariable Koodisto koodisto) {
        return koodistoService.list(koodisto);
    }

}
