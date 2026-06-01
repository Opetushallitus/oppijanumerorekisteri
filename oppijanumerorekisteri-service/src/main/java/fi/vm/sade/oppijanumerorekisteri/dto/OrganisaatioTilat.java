package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class OrganisaatioTilat {

    public static String AKTIIVISET_KEY = "aktiiviset";
    public static String SUUNNITELLUT_KEY = "suunnitellut";
    public static String LAKKAUTETUT_KEY = "lakkautetut";

    private final boolean aktiiviset;
    private final boolean suunnitellut;
    private final boolean lakkautetut;

    public static OrganisaatioTilat vainAktiiviset() {
        return new OrganisaatioTilat(true, false, false);
    }

    public static OrganisaatioTilat aktiivisetJaLakkautetut() {
        return new OrganisaatioTilat(true, false, true);
    }

    public Map<String, Boolean> asMap() {
        Map<String, Boolean> map = new LinkedHashMap<>();
        map.put(AKTIIVISET_KEY, aktiiviset);
        map.put(SUUNNITELLUT_KEY, suunnitellut);
        map.put(LAKKAUTETUT_KEY, lakkautetut);
        return map;
    }

    public MultiValueMap<String, String> asMultiValueMap() {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(AKTIIVISET_KEY, String.valueOf(aktiiviset));
        map.add(SUUNNITELLUT_KEY, String.valueOf(suunnitellut));
        map.add(LAKKAUTETUT_KEY, String.valueOf(lakkautetut));
        return map;
    }

}
