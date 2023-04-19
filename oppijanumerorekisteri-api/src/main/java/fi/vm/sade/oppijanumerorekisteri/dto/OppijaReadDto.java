package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Date;
import java.util.Set;

@Getter
@Setter
public class OppijaReadDto {

    private String oid;
    private String oppijanumero;
    private Date luotu;
    private Date muokattu;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private LocalDate syntymaaika;
    private KoodiNimiReadDto sukupuoli;
    private KoodiNimiReadDto aidinkieli;
    private Collection<KoodiNimiReadDto> kansalaisuus;
    private KoodiNimiReadDto kotikunta;
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma;
    private boolean passivoitu;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Set<String> linked;
}
