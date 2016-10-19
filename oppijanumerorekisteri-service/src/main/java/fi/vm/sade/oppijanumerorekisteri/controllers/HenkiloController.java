package fi.vm.sade.oppijanumerorekisteri.controllers;

import DTOs.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.utils.UserDetailsUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "Henkilöt")
@RestController
@RequestMapping("/henkilo")
public class HenkiloController {
    private HenkiloService henkiloService;

    public HenkiloController(HenkiloService henkiloService) {
        this.henkiloService = henkiloService;
    }

    @ApiOperation("Palauttaa tiedon, onko kirjautuneella käyttäjällä henkilötunnus järjestelmässä")
    @RequestMapping(value = "/current/hasHetu", method = RequestMethod.GET)
    public Boolean hasHetu() {
        // get oid from security context
        return henkiloService.getHasHetu(UserDetailsUtil.getCurrentUserOid());
    }

    @ApiOperation("Hakee henkilöiden perustiedot nimen perusteella")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerusByName", method = RequestMethod.GET)
    public List<HenkiloPerustietoDto> henkiloPerustietosByName(@RequestParam(value = "etunimet", required = false) String etunimet,
                                                               @RequestParam(value = "sukunimi", required = false) String sukunimi) {
        return this.henkiloService.getHenkiloPerustietosByName(etunimet, sukunimi);
    }

    @ApiOperation("Hakee henkilön perustiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloPerusByHetu/{hetu}", method = RequestMethod.GET)
    public HenkiloPerustietoDto henkiloPerustietosByHetu(@PathVariable String hetu) {
        return this.henkiloService.getHenkiloPerustietosByHetu(hetu);
    }

}
