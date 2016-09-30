package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/henkilo")
public class HenkiloController {
    private OppijanumerorekisteriBusinessService oppijanumerorekisteriBusinessService;

    public HenkiloController(OppijanumerorekisteriBusinessService oppijanumerorekisteriBusinessService) {
        this.oppijanumerorekisteriBusinessService = oppijanumerorekisteriBusinessService;
    }

    @RequestMapping(value = "/current/hasHetu", method = RequestMethod.GET)
    public Boolean hasHetu() {
        // get oid from security context
        return oppijanumerorekisteriBusinessService.getHasHetu(getCurrentUserOid());
    }

    /**
     * Fetches user oid from SecurityContext
     *
     * @return oid of currently authenticated user
     * @throws NullPointerException
     *             if user oid is not available from security context
     */
    private String getCurrentUserOid() throws NullPointerException {
        String oid = SecurityContextHolder.getContext().getAuthentication().getName();
        if (oid == null) {
            throw new NullPointerException("No user name available from SecurityContext!");
        }

        return oid;
    }
}
