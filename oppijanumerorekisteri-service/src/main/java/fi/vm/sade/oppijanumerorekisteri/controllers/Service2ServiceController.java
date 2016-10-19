package fi.vm.sade.oppijanumerorekisteri.controllers;

import DTOs.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "Service To Service")
@RestController
@RequestMapping("/s2s")
public class Service2ServiceController {
    private HenkiloService henkiloService;

    @Autowired
    public Service2ServiceController(HenkiloService henkiloService) {
        this.henkiloService = henkiloService;
    }

    @ApiOperation("Palauttaa, onko annettu henkilö OID järjestelmässä")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/oidExists/{oid}", method = RequestMethod.GET)
    public boolean oidExists(@PathVariable String oid) {
        return this.henkiloService.getOidExists(oid);
    }

    @ApiOperation("Hakee annettua henkilötunnusta vastaavan henkilö OID:n")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/oidByHetu/{hetu}", method = RequestMethod.GET)
    public String oidByHetu(@PathVariable String hetu) {
        return this.henkiloService.getOidByHetu(hetu);
    }

    @ApiOperation("Hakee annetun henkilö OID listaa vastaavien henkilöiden perustiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkilotByHenkiloOidList", method = RequestMethod.POST)
    public List<HenkiloPerustietoDto> henkilotByHenkiloOidList(@RequestBody List<String> henkiloOids) {
        return this.henkiloService.getHenkiloPerustietosByOids(henkiloOids);
    }
}
