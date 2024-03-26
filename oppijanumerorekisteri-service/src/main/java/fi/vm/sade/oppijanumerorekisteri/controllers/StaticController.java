package fi.vm.sade.oppijanumerorekisteri.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import io.swagger.v3.oas.annotations.Hidden;

@Hidden
@Controller
@RequestMapping("/")
public class StaticController {
    @RequestMapping({"/swagger", "/swagger/**", "/swagger-ui.html"})
    public String swagger() {
        return "redirect:/swagger-ui/";
    }
}
