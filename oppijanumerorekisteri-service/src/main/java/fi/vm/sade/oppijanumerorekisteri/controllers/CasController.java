package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "CAS")
@RestController
@RequestMapping("/cas")
@RequiredArgsConstructor
public class CasController {

    private final IdentificationService identificationService;

    @ApiOperation(value = "Auttaa CAS session avaamisessa oppijanumerorekisteriin.",
            notes = "Jos kutsuja haluaa tehdä useita rinnakkaisia kutsuja eikä CAS sessiota ole vielä avattu, " +
                    "täytyy tätä kutsua ensin.",
            authorizations = @Authorization("login"),
            response = ResponseEntity.class)
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/prequel", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
    public String requestGet() {
        return "ok";
    }

    @ApiOperation(value = "Auttaa CAS session avaamisessa oppijanumerorekisteriin.",
            notes = "Jos kutsuja haluaa tehdä useita rinnakkaisia kutsuja eikä CAS sessiota ole vielä avattu, " +
                    "täytyy tätä kutsua ensin.",
            authorizations = @Authorization("login"),
            response = ResponseEntity.class)
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/prequel", method = RequestMethod.POST)
    public ResponseEntity<String> requestPost() {
        return new ResponseEntity<>("ok", HttpStatus.OK);
    }

    @ApiOperation(value = "Yrittää asettaa vahvasti tunnistautuneelle henkilölle henkilötunnuksen", authorizations = @Authorization("onr"))
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @RequestMapping(value = "/henkilo/{oidHenkilo}/vahvaTunnistus", method = RequestMethod.PUT)
    public void setVahvaTunnistusHetu(@PathVariable String oidHenkilo,
                                      @Validated @RequestBody HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto) {
        this.identificationService.setStrongIdentifiedHetu(oidHenkilo, henkiloVahvaTunnistusDto);
    }

}
