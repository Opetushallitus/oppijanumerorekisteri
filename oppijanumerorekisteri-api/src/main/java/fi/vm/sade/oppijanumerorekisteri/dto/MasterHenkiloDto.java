package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MasterHenkiloDto<T> {

    private String oid;
    private T master;

}
