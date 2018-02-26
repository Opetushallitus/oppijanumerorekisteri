package fi.vm.sade.henkiloui.client;

import fi.vm.sade.henkiloui.dto.LokalisointiCriteria;
import fi.vm.sade.henkiloui.dto.LokalisointiDto;
import java.util.Collection;

public interface LokalisointiClient {

    Collection<LokalisointiDto> list(LokalisointiCriteria criteria);

    void update(Collection<LokalisointiDto> dto);

}
