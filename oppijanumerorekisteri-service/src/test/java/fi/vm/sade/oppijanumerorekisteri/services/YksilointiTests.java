package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.scheduling.YksilointiTask;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import static java.util.Collections.singletonList;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import org.joda.time.DateTime;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@IntegrationTest
public class YksilointiTests {

    @MockBean
    private VtjClient vtjClientMock;
    @MockBean
    private KayttooikeusClient kayttooikeusClientMock;
    @Autowired
    private DatabaseService databaseService;

    @Autowired
    private YksilointiTask yksilointiTask;
    @Autowired
    private YksilointiService yksilointiService;
    @Autowired
    private HenkiloService henkiloService;
    @Autowired
    private HenkiloModificationService henkiloModificationService;

    @After
    public void cleanup() {
        databaseService.truncate();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void paivitaYksilointitiedot() {
        String hetu = "190198-727T";
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setHetu(hetu);
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(hetu);
        yksiloityHenkilo.setKutsumanimi("Teppo");
        yksiloityHenkilo.setEtunimi("Teppo");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(any())).thenReturn(Optional.of(yksiloityHenkilo));

        DateTime modifiedSince = DateTime.now();
        yksilointiTask.execute(null, null);

        assertThat(henkiloService.getByHetu(hetu))
                .returns("Teppo", from(HenkiloReadDto::getEtunimet))
                .returns(true, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());

        modifiedSince = DateTime.now();
        yksilointiService.paivitaYksilointitiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void yliajaHenkilonTiedot() {
        String hetu = "190198-727T";
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setHetu(hetu);
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(hetu);
        yksiloityHenkilo.setKutsumanimi("Esa");
        yksiloityHenkilo.setEtunimi("Esa");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(any())).thenReturn(Optional.of(yksiloityHenkilo));

        DateTime modifiedSince = DateTime.now();
        yksilointiTask.execute(null, null);

        assertThat(henkiloService.getByHetu(hetu))
                .returns("teppo", from(HenkiloReadDto::getEtunimet))
                .returns(false, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());

        modifiedSince = DateTime.now();
        yksilointiService.yliajaHenkilonTiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getByHetu(hetu))
                .returns("Esa", from(HenkiloReadDto::getEtunimet))
                .returns(true, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void hetuttomanYksilointiJaPuraHeikkoYksilointi() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);

        DateTime modifiedSince = DateTime.now();
        yksilointiService.hetuttomanYksilointi(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getHenkilosByOids(singletonList(henkiloReadDto.getOidHenkilo())).get(0))
                .returns(true, from(HenkiloDto::isYksiloity))
                .returns(false, from(HenkiloDto::isYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());

        modifiedSince = DateTime.now();
        yksilointiService.puraHeikkoYksilointi(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getHenkilosByOids(singletonList(henkiloReadDto.getOidHenkilo())).get(0))
                .returns(false, from(HenkiloDto::isYksiloity))
                .returns(false, from(HenkiloDto::isYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
    }

}
