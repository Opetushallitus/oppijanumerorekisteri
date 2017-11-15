package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import java.time.LocalDate;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaReadDto {

    @ApiModelProperty("Lähdejärjestelmän käyttämä tunniste henkilölle")
    private String tunniste;

    private OppijaReadHenkiloDto henkilo;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OppijaReadHenkiloDto {

        private String oid;

        private String oppijanumero;

        private Date luotu;

        private Date muokattu;

        private String hetu;

        private LocalDate syntymaaika;

        private String etunimet;

        private String kutsumanimi;

        private String sukunimi;

        private YksilointiTila yksilointiTila;

    }

}
