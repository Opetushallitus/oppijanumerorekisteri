package fi.vm.sade.henkiloui.controllers;

import fi.vm.sade.henkiloui.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/config")
public class ConfigController {
    private final UrlConfiguration urlProperties;

    @Autowired
    public ConfigController(UrlConfiguration urlProperties) {
        this.urlProperties = urlProperties;
    }

    @RequestMapping(value = "/frontProperties", method = RequestMethod.GET, produces = "text/plain")
    public String frontPropertiesJson() {
        return urlProperties.frontPropertiesToJson();
    }
}
