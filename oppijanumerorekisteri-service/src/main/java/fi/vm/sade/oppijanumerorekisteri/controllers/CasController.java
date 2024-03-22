package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "CAS")
@RestController
@RequestMapping("/cas")
@RequiredArgsConstructor
public class CasController {

    private final IdentificationService identificationService;

    @Operation(summary = "Auttaa CAS session avaamisessa oppijanumerorekisteriin.",
            description = "Jos kutsuja haluaa tehdä useita rinnakkaisia kutsuja eikä CAS sessiota ole vielä avattu, " +
                    "täytyy tätä kutsua ensin.")
    @ApiResponses(value = {
        @ApiResponse(content = {@Content(mediaType = "application/json", schema = @Schema(implementation = ResponseEntity.class))})
    })
    @Schema(implementation = ResponseEntity.class)
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/prequel", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
    public String requestGet() {
        return "ok";
    }

    @Operation(summary = "Auttaa CAS session avaamisessa oppijanumerorekisteriin.",
            description = "Jos kutsuja haluaa tehdä useita rinnakkaisia kutsuja eikä CAS sessiota ole vielä avattu, " +
                    "täytyy tätä kutsua ensin.")
    @ApiResponses(value = {
        @ApiResponse(content = {@Content(mediaType = "application/json", schema = @Schema(implementation = ResponseEntity.class))})
    })
    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "/prequel", method = RequestMethod.POST)
    public ResponseEntity<String> requestPost() {
        return new ResponseEntity<>("ok", HttpStatus.OK);
    }

    @Operation(summary = "Yrittää asettaa vahvasti tunnistautuneelle henkilölle henkilötunnuksen")
    @PreAuthorize("hasAnyRole('APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA')")
    @RequestMapping(value = "/henkilo/{oidHenkilo}/vahvaTunnistus", method = RequestMethod.PUT)
    public void setVahvaTunnistusHetu(@PathVariable String oidHenkilo,
                                      @Validated @RequestBody HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto) {
        this.identificationService.setStrongIdentifiedHetu(oidHenkilo, henkiloVahvaTunnistusDto);
    }

}
