package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.utils.UserDetailsUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.HeaderParam;

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
    @Transactional
    public Boolean hasHetu() {
        // get oid from security context
        return henkiloService.getHasHetu(UserDetailsUtil.getCurrentUserOid());
    }

    @ApiOperation("Hakee annetun henkilön nimeä tai henkilötunnusta vastaavien henkilöiden perustiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/henkiloByNameOrHetu", method = RequestMethod.GET)
    public void henkilotByHenkiloOidList(@RequestParam(value = "name", required = false) String name,
                                         @RequestParam(value = "hetu", required = false) String hetu) {
//        return this.oppijanumerorekisteriBusinessService.;
    }
    
    @ApiOperation("Hakee annetun henkilön kaikki yhteystiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
     // TODO: @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot", method = RequestMethod.GET)
    public HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(
            @ApiParam("Henkilön OID") @PathVariable("oid") String oid/**,
            TODO: @P("permissionService") @RequestHeader("External-Permission-Service")
                    PermissionChecker.ExternalPermissionService permissionService */) {
        return henkiloService.getHenkiloYhteystiedot(oid);
    }

    @ApiOperation("Hakee annetun henkilön yhteystietoryhmän yhteystiedot")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    // TODO: @PreAuthorize("@permissionChecker.isAllowedToAccessPerson(#oid, {'READ_UPDATE', 'CRUD'}, #permissionService)")
    @RequestMapping(value = "/{oid}/yhteystiedot/{ryhma}", method = RequestMethod.GET)
    public YhteystiedotDto getHenkiloYhteystiedot(@ApiParam("Henkilön OID") @PathVariable("oid") String oid,
                  @ApiParam("Ryhmän nimi tai kuvaus") @PathVariable("ryhma") String ryhma/**,
                   TODO: @P("permissionService") @RequestHeader("External-Permission-Service")
                           PermissionChecker.ExternalPermissionService permissionService */) {
        return henkiloService.getHenkiloYhteystiedot(oid, YhteystietoRyhma.forValue(ryhma))
                .orElseThrow(() -> new ResourceNotFoundException("Yhteystiedot not found by ryhma="+ryhma));
    }
}
