package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.enums.YksilointivirheTila;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class YksilointiVirheDto {
    private YksilointivirheTila yksilointivirheTila;

    private Date uudelleenyritysAikaleima;

}
