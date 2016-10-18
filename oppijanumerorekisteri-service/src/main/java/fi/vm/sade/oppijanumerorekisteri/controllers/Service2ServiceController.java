package fi.vm.sade.oppijanumerorekisteri.controllers;

import DTOs.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/s2s")
public class Service2ServiceController {
    private OppijanumerorekisteriBusinessService oppijanumerorekisteriBusinessService;

    @Autowired
    public Service2ServiceController(OppijanumerorekisteriBusinessService oppijanumerorekisteriBusinessService) {
        this.oppijanumerorekisteriBusinessService = oppijanumerorekisteriBusinessService;
    }

    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/oidExists/{oid}", method = RequestMethod.GET)
    public boolean oidExists(@PathVariable String oid) {
        return this.oppijanumerorekisteriBusinessService.getOidExists(oid);
    }

    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/oidByHetu/{hetu}", method = RequestMethod.GET)
    public String oidByHetu(@PathVariable String hetu) {
        return this.oppijanumerorekisteriBusinessService.getOidByHetu(hetu);
    }

    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkilotByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(@RequestBody List<String> henkiloOids) {
        return this.oppijanumerorekisteriBusinessService.getHenkiloPerustietosByOids(henkiloOids);
    }
}
