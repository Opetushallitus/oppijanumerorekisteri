package fi.vm.sade.oppijanumerorekisteri.mappers;

import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;

@Component
@ComponentScan("fi.vm.sade.oppijanumerorekisteri.mappers")
public class OrikaConfiguration extends OrikaSpringMapper {
}
