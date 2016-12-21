package fi.vm.sade.oppijanumerorekisteri.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class StaticController {
    @RequestMapping("/swagger")
    public String swagger() {
        return "redirect:/swagger-ui.html";
    }

    @RequestMapping("/swagger/**")
    public String swaggerThereafter() {
        return "redirect:/swagger-ui.html";
    }
}
