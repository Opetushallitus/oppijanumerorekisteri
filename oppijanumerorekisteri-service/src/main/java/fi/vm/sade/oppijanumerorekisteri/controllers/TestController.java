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


    private TestBusinessService testBusinessService;

    @Autowired
    public TestController(TestBusinessService testBusinessService) {
        this.testBusinessService = testBusinessService;
    }

    @RequestMapping(value = "/hello", method = RequestMethod.GET)
    public String test() {
        logger.error("HELLLOOOUUU ");
        long henkiloCount = testBusinessService.getHenkiloCountFromDb();
        logger.error(Long.toString(henkiloCount));
        return "Hello " + Long.toString(henkiloCount);
    }
}
