package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHetuAndOidDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Api(tags = "Service To Service")
@RestController
@RequestMapping("/s2s")
public class Service2ServiceController {
    private HenkiloService henkiloService;

    private Environment environment;

    @Autowired
    public Service2ServiceController(HenkiloService henkiloService, Environment environment) {
        this.henkiloService = henkiloService;
        this.environment = environment;
    }

    @ApiOperation("Hakee annettua henkilötunnusta vastaavan henkilö OID:n")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "Not Found")})
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/oidByHetu/{hetu}", method = RequestMethod.GET)
    public String oidByHetu(@PathVariable String hetu) {
        return this.henkiloService.getOidByHetu(hetu);
    }

    @ApiOperation(value = "Hakee hetu & oid -yhdistelmät")
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/hetusAndOids", method = RequestMethod.GET)
    public List<HenkiloHetuAndOidDto> hetusAndOidsOrderedByLastVtjSyncTimestamp(
            @ApiParam(value = "Hakee vain ne identiteetit, jotka on päivitetty VTJ:stä ennen annettua ajanhetkeä")
            @RequestParam(value = "syncedBeforeTimestamp", required = false)
            Long syncedBeforeTimestamp,
            @RequestParam(value = "offset", required = false, defaultValue = "0")
            long offset,
            @RequestParam(value = "limit", required = false, defaultValue = "100")
            long limit) {
        return this.henkiloService.getHetusAndOids(syncedBeforeTimestamp, offset, limit);
    }

    @ApiOperation(value = "Hakee tai luo uuden henkilön annetuista henkilon perustiedoista")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "Validation exception")})
    @PreAuthorize("hasRole('APP_HENKILONHALLINTA_OPHREKISTERI')")
    @RequestMapping(value = "/findOrCreateHenkiloPerustieto", method = RequestMethod.POST)
    public ResponseEntity<HenkiloPerustietoDto> createNewHenkilo(@Validated @RequestBody HenkiloPerustietoDto henkiloPerustietoDto) {
        HenkiloPerustietoDto returnDto = this.henkiloService.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDto);
        if(returnDto.isCreatedOnService()) {
            return ResponseEntity.created(URI.create(this.environment.getProperty("server.contextPath") + "/henkilo/"
                    + returnDto.getOidHenkilo())).body(returnDto);
        }
        else {
            return ResponseEntity.ok(returnDto);
        }
    }

}
