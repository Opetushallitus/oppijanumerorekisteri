package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Date;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@RunWith(SpringRunner.class)
@IntegrationTest
public class HenkilotietomuutosHetuSyncTaskTest {

    @Autowired
    private HenkilotietomuutosHetuSyncTask task;
    @Autowired
    private DatabaseService databaseService;
    @Autowired
    private HenkiloRepository henkiloRepository;
    @MockBean
    private MuutostietoClient muutostietoClient;

    @After
    public void cleanup() {
        databaseService.truncate();
    }

    @Test
    public void execute() {
        databaseService.runInTransaction(() -> {
            Henkilo henkilo = new Henkilo();
            henkilo.setCreated(new Date());
            henkilo.setModified(henkilo.getCreated());
            henkilo.setOidHenkilo("oid1");
            henkilo.setHetu("hetu1");
            henkilo.setEtunimet("etunimet1 kutsumanimi1");
            henkilo.setKutsumanimi("kutsumanimi1");
            henkilo.setSukunimi("sukunimi1");
            henkilo.setYksiloityVTJ(true);
            henkilo.setVtjRegister(false);
            henkiloRepository.save(henkilo);
        });

        task.execute(null, null);

        ArgumentCaptor<MuutostietoHetus> captor = ArgumentCaptor.forClass(MuutostietoHetus.class);
        verify(muutostietoClient).sendHetus(captor.capture());
        MuutostietoHetus muutostietoHetus = captor.getValue();
        assertThat(muutostietoHetus).extracting(MuutostietoHetus::getAddedHetus).isEqualTo(singletonList("hetu1"));
        databaseService.runInTransaction(() -> {
            assertThat(henkiloRepository.findByOidHenkilo("oid1")).isPresent().hasValueSatisfying(henkilo -> {
                assertThat(henkilo).extracting(Henkilo::isVtjRegister).isEqualTo(true);
            });
        });
    }

}
