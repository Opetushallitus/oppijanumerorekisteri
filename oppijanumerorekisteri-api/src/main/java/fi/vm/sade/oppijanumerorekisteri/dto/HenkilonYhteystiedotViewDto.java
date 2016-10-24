package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class HenkilonYhteystiedotViewDto implements Serializable {
    private final Map<YhteystietoRyhma, YhteystiedotDto> yhteystiedot;

    public HenkilonYhteystiedotViewDto() {
        this.yhteystiedot= new HashMap<>();
    }
    
    @JsonCreator
    public HenkilonYhteystiedotViewDto(Map<YhteystietoRyhma, YhteystiedotDto> yhteystiedot) {
        this.yhteystiedot = yhteystiedot;
    }
    
    public HenkilonYhteystiedotViewDto put(YhteystietoRyhma ryhma, YhteystiedotDto yhteystiedot) {
        this.yhteystiedot.put(ryhma, yhteystiedot);
        return this;
    }

    public YhteystiedotDto get(YhteystietoRyhma ryhma) {
        return this.yhteystiedot.get(ryhma);
    }

    @JsonValue
    public Map<YhteystietoRyhma, YhteystiedotDto> asMap() {
        return yhteystiedot;
    }
    
    public ReadableYhteystiedot get(YhteystietoRyhma ...ryhmatInPriorityOrder) {
        return new HenkilonYhteystiedotByPriorityOrderDto(yhteystiedot, true, ryhmatInPriorityOrder);
    }
    
    public ReadableYhteystiedot getExclusively(YhteystietoRyhma ...ryhmatInPriorityOrder) {
        return new HenkilonYhteystiedotByPriorityOrderDto(yhteystiedot, false, ryhmatInPriorityOrder);
    }
}
