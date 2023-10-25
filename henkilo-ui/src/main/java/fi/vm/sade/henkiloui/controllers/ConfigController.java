package fi.vm.sade.henkiloui.controllers;

import fi.vm.sade.henkiloui.configurations.properties.UrlConfiguration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/config")
public class ConfigController {
    private final UrlConfiguration urlProperties;

    public ConfigController(UrlConfiguration urlProperties) {
        this.urlProperties = urlProperties;
    }

    @GetMapping(value = "/frontProperties", produces = "text/plain")
    public String frontPropertiesJson() {
        return urlProperties.frontPropertiesToJson();
    }
}
