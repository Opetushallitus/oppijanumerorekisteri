package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@IntegrationTest
@Transactional
@Sql("/sql/henkilo-modification-test.sql")
public class HenkiloModificationServiceIntegrationTest {
    @Autowired
    private HenkiloModificationService henkiloModificationService;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @Autowired
    private HenkiloRepository henkiloRepository;

    @Autowired
    private HenkiloViiteRepository henkiloViiteRepository;

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void updateVtjYksiloityHetuAndVtjYksiloityHasHenkiloHasNewHetu() {
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setOidHenkilo("VTJYKSILOITY1");
        henkiloForceUpdateDto.setHetu("111111-1234");

        HenkiloReadDto henkiloReadDto = this.henkiloModificationService.forceUpdateHenkilo(henkiloForceUpdateDto);

        assertThat(henkiloReadDto)
                .extracting(HenkiloReadDto::getOidHenkilo, HenkiloReadDto::getHetu, HenkiloReadDto::getYksiloityVTJ)
                .containsExactly("VTJYKSILOITY1", "111111-1234", true);

        Henkilo henkilo = this.henkiloRepository.findByOidHenkilo("VTJYKSILOITY2")
                .orElseThrow(RuntimeException::new);
        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksiloityVTJ)
                .containsExactly("VTJYKSILOITY2", null, false);

        List<HenkiloViite> henkiloViiteList = this.henkiloViiteRepository.findByMasterOid("VTJYKSILOITY1");
        assertThat(henkiloViiteList)
                .flatExtracting(HenkiloViite::getMasterOid, HenkiloViite::getSlaveOid)
                .containsExactly("VTJYKSILOITY1", "VTJYKSILOITY2");
    }
}
