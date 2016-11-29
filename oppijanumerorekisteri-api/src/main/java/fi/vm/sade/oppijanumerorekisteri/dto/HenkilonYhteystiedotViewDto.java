package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class HenkilonYhteystiedotViewDto implements Serializable {
    private final Map<YhteystietoRyhmaKuvaus, YhteystiedotDto> yhteystiedot;

    public HenkilonYhteystiedotViewDto() {
        this.yhteystiedot= new HashMap<>();
    }
    
    @JsonCreator
    public HenkilonYhteystiedotViewDto(Map<YhteystietoRyhmaKuvaus, YhteystiedotDto> yhteystiedot) {
        this.yhteystiedot = yhteystiedot;
    }
    
    public HenkilonYhteystiedotViewDto put(YhteystietoRyhmaKuvaus ryhma, YhteystiedotDto yhteystiedot) {
        this.yhteystiedot.put(ryhma, yhteystiedot);
        return this;
    }

    public YhteystiedotDto get(YhteystietoRyhmaKuvaus ryhma) {
        return this.yhteystiedot.get(ryhma);
    }

    @JsonValue
    public Map<YhteystietoRyhmaKuvaus, YhteystiedotDto> asMap() {
        return yhteystiedot;
    }
    
    public ReadableYhteystiedot get(YhteystietoRyhmaKuvaus...ryhmatInPriorityOrder) {
        return new HenkilonYhteystiedotByPriorityOrderDto(yhteystiedot, true, ryhmatInPriorityOrder);
    }
    
    public ReadableYhteystiedot getExclusively(YhteystietoRyhmaKuvaus...ryhmatInPriorityOrder) {
        return new HenkilonYhteystiedotByPriorityOrderDto(yhteystiedot, false, ryhmatInPriorityOrder);
    }
}
