package fi.vm.sade.oppijanumerorekisteri.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class StaticController {
    @RequestMapping({"/swagger", "/swagger/**", "/swagger-ui.html"})
    public String swagger() {
        return "redirect:/swagger-ui/";
    }
}
