package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.services.TestBusinessService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private Environment environment;

    private TestBusinessService testBusinessService;

    @Autowired
    public TestController(Environment environment, TestBusinessService testBusinessService) {
        this.environment = environment;
        this.testBusinessService = testBusinessService;
    }

    @RequestMapping(value = "/hello", method = RequestMethod.GET)
    public String test() {
        logger.error("HELLLOOOUUU " + environment.getProperty("arpa"));
        long henkiloCount = testBusinessService.getHenkiloCountFromDb();
        return "Hello " + Long.toString(henkiloCount);
    }
}
