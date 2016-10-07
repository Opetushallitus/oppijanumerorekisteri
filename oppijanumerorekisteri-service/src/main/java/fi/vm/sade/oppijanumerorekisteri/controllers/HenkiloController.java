package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import fi.vm.sade.oppijanumerorekisteri.utils.UserDetailsUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional
    public Boolean hasHetu() {
        // get oid from security context
        return oppijanumerorekisteriBusinessService.getHasHetu(UserDetailsUtil.getCurrentUserOid());
    }
}
