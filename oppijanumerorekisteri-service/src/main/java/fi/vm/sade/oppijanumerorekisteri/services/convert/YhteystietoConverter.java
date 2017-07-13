package fi.vm.sade.oppijanumerorekisteri.services.convert;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.TreeMap;

@Component
public class YhteystietoConverter {
    
    public Map<String,YhteystiedotDto> toHenkiloYhteystiedot(Collection<YhteystietoHakuDto> results) {
        Map<String,YhteystiedotDto> grouped = new TreeMap<>();
        results.forEach(yt -> {
            String ryhma = yt.getRyhmaKuvaus();
            YhteystiedotDto tiedot = grouped.computeIfAbsent(ryhma, k -> new YhteystiedotDto(yt.getRyhmaAlkuperaTieto(), yt.getReadOnly()));
            yt.getYhteystietoTyyppi().getSetter().set(tiedot, yt.getArvo());
        });
        return grouped;
    }
    
}
