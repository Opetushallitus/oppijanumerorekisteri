package fi.vm.sade.oppijanumerorekisteri.services.convert;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.TreeMap;

@Component
public class YhteystietoConverter {
    
    public Map<YhteystietoRyhma,YhteystiedotDto> toHenkiloYhteystiedot(Collection<YhteystietoHakuDto> results) {
        Map<YhteystietoRyhma,YhteystiedotDto> grouped = new TreeMap<>();
        results.forEach(yt -> {
            YhteystietoRyhma ryhma = YhteystietoRyhma.forValue(yt.getRyhmaKuvaus());
            YhteystiedotDto tiedot = grouped.get(ryhma);
            if (tiedot == null) {
                tiedot = new YhteystiedotDto();
                grouped.put(ryhma, tiedot);
            }
            yt.getYhteystietoTyyppi().getSetter().set(tiedot, yt.getArvo());
        });
        return grouped;
    }
    
}
