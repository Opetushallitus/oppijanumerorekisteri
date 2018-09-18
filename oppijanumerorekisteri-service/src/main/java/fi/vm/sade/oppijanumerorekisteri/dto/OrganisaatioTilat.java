package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class OrganisaatioTilat {

    private final boolean aktiiviset;
    private final boolean suunnitellut;
    private final boolean lakkautetut;

    public static OrganisaatioTilat vainAktiiviset() {
        return new OrganisaatioTilat(true, false, false);
    }

    public Map<String, Boolean> asMap() {
        Map<String, Boolean> map = new LinkedHashMap<>();
        map.put("aktiiviset", aktiiviset);
        map.put("suunnitellut", suunnitellut);
        map.put("lakkautetut", lakkautetut);
        return map;
    }

}
