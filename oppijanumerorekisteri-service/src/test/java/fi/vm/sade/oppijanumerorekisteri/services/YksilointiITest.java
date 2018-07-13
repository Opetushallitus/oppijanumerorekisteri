package fi.vm.sade.oppijanumerorekisteri.services;

import com.amazonaws.services.sns.AmazonSNS;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.scheduling.YksilointiTask;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysHakemus;
import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysKayttooikeus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysHakemusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysKayttooikeusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HetuRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.joda.time.DateTime;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@IntegrationTest
public class YksilointiITest {

    @MockBean
    private VtjClient vtjClientMock;
    @MockBean
    private KayttooikeusClient kayttooikeusClientMock;
    @MockBean
    private AmazonSNS amazonSNS;
    @Autowired
    private DatabaseService databaseService;
    @MockBean
    private OppijaTuontiService oppijaTuontiService;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private YksilointiTask yksilointiTask;
    @Autowired
    private YksilointiService yksilointiService;
    @Autowired
    private HenkiloService henkiloService;
    @Autowired
    private HenkiloModificationService henkiloModificationService;
    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private HetuRepository hetuRepository;
    @Autowired
    private AsiayhteysHakemusRepository asiayhteysHakemusRepository;
    @Autowired
    private AsiayhteysKayttooikeusRepository asiayhteysKayttooikeusRepository;



    @After
    public void cleanup() {
        databaseService.truncate();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksiloiAutomaattisestiHetuMuutosUusiHetuYksiloityEnsin() {
        String uusiHetu = "200198-7484";
        String vanhaHetu = "190198-5259";
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(uusiHetu);
        yksiloityHenkilo.setKutsumanimi("Teppo");
        yksiloityHenkilo.setEtunimi("Teppo");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(eq(uusiHetu))).thenReturn(Optional.of(yksiloityHenkilo));
        when(vtjClientMock.fetchHenkilo(eq(vanhaHetu))).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloCreateDto henkiloUusiHetuCreateDto = new HenkiloCreateDto();
        henkiloUusiHetuCreateDto.setHetu(uusiHetu);
        henkiloUusiHetuCreateDto.setKutsumanimi("Teppo");
        henkiloUusiHetuCreateDto.setEtunimet("Teppo");
        henkiloUusiHetuCreateDto.setSukunimi("Testaaja");
        String uusiOid = henkiloModificationService.createHenkilo(henkiloUusiHetuCreateDto).getOidHenkilo();

        reset(amazonSNS);

        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        assertPublished(1, uusiOid);

        HenkiloCreateDto henkiloVanhaHetuCreateDto = new HenkiloCreateDto();
        henkiloVanhaHetuCreateDto.setHetu(vanhaHetu);
        henkiloVanhaHetuCreateDto.setKutsumanimi("Teppo");
        henkiloVanhaHetuCreateDto.setEtunimet("Teppo");
        henkiloVanhaHetuCreateDto.setSukunimi("Testaaja");
        String vanhaOid = henkiloModificationService.createHenkilo(henkiloVanhaHetuCreateDto).getOidHenkilo();

        reset(amazonSNS);

        yksilointiService.yksiloiAutomaattisesti(vanhaOid);

        assertPublished(2, uusiOid, vanhaOid);
        assertThat(henkiloRepository.findByOidHenkilo(vanhaOid)).hasValueSatisfying(henkiloByVanhaOid -> {
            assertThat(henkiloByVanhaOid)
                    .returns(null, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 19), Henkilo::getSyntymaaika)
                    .returns("1", Henkilo::getSukupuoli)
                    .returns(null, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(false, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(vanhaOid)).isEmpty();
        assertThat(henkiloRepository.findByOidHenkilo(uusiOid)).hasValueSatisfying(henkiloByUusiOid -> {
            assertThat(henkiloByUusiOid)
                    .returns(uusiHetu, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 20), Henkilo::getSyntymaaika)
                    .returns("2", Henkilo::getSukupuoli)
                    .returns(uusiOid, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(true, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(uusiOid)).containsExactlyInAnyOrder(vanhaHetu, uusiHetu);
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksiloiAutomaattisestiHetuMuutosVanhaHetuYksiloityEnsin() {
        String uusiHetu = "200198-7484";
        String vanhaHetu = "190198-5259";
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(uusiHetu);
        yksiloityHenkilo.setKutsumanimi("Teppo");
        yksiloityHenkilo.setEtunimi("Teppo");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(eq(uusiHetu))).thenReturn(Optional.of(yksiloityHenkilo));
        when(vtjClientMock.fetchHenkilo(eq(vanhaHetu))).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloCreateDto henkiloVanhaHetuCreateDto = new HenkiloCreateDto();
        henkiloVanhaHetuCreateDto.setHetu(vanhaHetu);
        henkiloVanhaHetuCreateDto.setKutsumanimi("Teppo");
        henkiloVanhaHetuCreateDto.setEtunimet("Teppo");
        henkiloVanhaHetuCreateDto.setSukunimi("Testaaja");
        String vanhaOid = henkiloModificationService.createHenkilo(henkiloVanhaHetuCreateDto).getOidHenkilo();

        HenkiloCreateDto henkiloUusiHetuCreateDto = new HenkiloCreateDto();
        henkiloUusiHetuCreateDto.setHetu(uusiHetu);
        henkiloUusiHetuCreateDto.setKutsumanimi("Teppo");
        henkiloUusiHetuCreateDto.setEtunimet("Teppo");
        henkiloUusiHetuCreateDto.setSukunimi("Testaaja");
        String uusiOid = henkiloModificationService.createHenkilo(henkiloUusiHetuCreateDto).getOidHenkilo();

        reset(amazonSNS);

        yksilointiService.yksiloiAutomaattisesti(vanhaOid);

        assertPublished(2, uusiOid, vanhaOid);

        reset(amazonSNS);

        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        assertPublished(0);
        assertThat(henkiloRepository.findByOidHenkilo(vanhaOid)).hasValueSatisfying(henkiloByVanhaOid -> {
            assertThat(henkiloByVanhaOid)
                    .returns(uusiHetu, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 20), Henkilo::getSyntymaaika)
                    .returns("2", Henkilo::getSukupuoli)
                    .returns(vanhaOid, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(true, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(vanhaOid)).containsExactlyInAnyOrder(vanhaHetu, uusiHetu);
        assertThat(henkiloRepository.findByOidHenkilo(uusiOid)).hasValueSatisfying(henkiloByUusiOid -> {
            assertThat(henkiloByUusiOid)
                    .returns(null, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 20), Henkilo::getSyntymaaika)
                    .returns("2", Henkilo::getSukupuoli)
                    .returns(null, Henkilo::getOppijanumero)
                    .returns(false, Henkilo::isYksilointiYritetty)
                    .returns(false, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(uusiOid)).isEmpty();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
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

        reset(amazonSNS);

        modifiedSince = DateTime.now();
        yksilointiService.paivitaYksilointitiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(1, henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
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

        reset(amazonSNS);

        modifiedSince = DateTime.now();
        yksilointiService.yliajaHenkilonTiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getByHetu(hetu))
                .returns("Esa", from(HenkiloReadDto::getEtunimet))
                .returns(true, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(1, henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yliajaHenkilonTiedotHetuMuutosUusiHetuYksiloityEnsin() {
        String uusiHetu = "200198-7484";
        String vanhaHetu = "190198-5259";
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(uusiHetu);
        yksiloityHenkilo.setKutsumanimi("Teppo");
        yksiloityHenkilo.setEtunimi("Teppo");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(eq(uusiHetu))).thenReturn(Optional.of(yksiloityHenkilo));
        when(vtjClientMock.fetchHenkilo(eq(vanhaHetu))).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloCreateDto henkiloUusiHetuCreateDto = new HenkiloCreateDto();
        henkiloUusiHetuCreateDto.setHetu(uusiHetu);
        henkiloUusiHetuCreateDto.setKutsumanimi("Teppo");
        henkiloUusiHetuCreateDto.setEtunimet("Teppo");
        henkiloUusiHetuCreateDto.setSukunimi("Testaaja");
        String uusiOid = henkiloModificationService.createHenkilo(henkiloUusiHetuCreateDto).getOidHenkilo();
        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        HenkiloCreateDto henkiloVanhaHetuCreateDto = new HenkiloCreateDto();
        henkiloVanhaHetuCreateDto.setHetu(vanhaHetu);
        henkiloVanhaHetuCreateDto.setKutsumanimi("Tiina");
        henkiloVanhaHetuCreateDto.setEtunimet("Tiina");
        henkiloVanhaHetuCreateDto.setSukunimi("Testaaja");
        String vanhaOid = henkiloModificationService.createHenkilo(henkiloVanhaHetuCreateDto).getOidHenkilo();
        yksilointiService.yksiloiAutomaattisesti(vanhaOid);

        reset(amazonSNS);

        yksilointiService.yliajaHenkilonTiedot(vanhaOid);

        assertPublished(2, uusiOid, vanhaOid);
        assertThat(henkiloRepository.findByOidHenkilo(vanhaOid)).hasValueSatisfying(henkiloByVanhaOid -> {
            assertThat(henkiloByVanhaOid)
                    .returns(null, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 19), Henkilo::getSyntymaaika)
                    .returns("1", Henkilo::getSukupuoli)
                    .returns(null, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(false, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(vanhaOid)).isEmpty();
        assertThat(henkiloRepository.findByOidHenkilo(uusiOid)).hasValueSatisfying(henkiloByUusiOid -> {
            assertThat(henkiloByUusiOid)
                    .returns(uusiHetu, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 20), Henkilo::getSyntymaaika)
                    .returns("2", Henkilo::getSukupuoli)
                    .returns(uusiOid, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(true, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(uusiOid)).containsExactlyInAnyOrder(vanhaHetu, uusiHetu);
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yliajaHenkilonTiedotHetuMuutosVanhaHetuYksiloityEnsin() {
        String uusiHetu = "200198-7484";
        String vanhaHetu = "190198-5259";
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(uusiHetu);
        yksiloityHenkilo.setKutsumanimi("Teppo");
        yksiloityHenkilo.setEtunimi("Teppo");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(eq(uusiHetu))).thenReturn(Optional.of(yksiloityHenkilo));
        when(vtjClientMock.fetchHenkilo(eq(vanhaHetu))).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloCreateDto henkiloVanhaHetuCreateDto = new HenkiloCreateDto();
        henkiloVanhaHetuCreateDto.setHetu(vanhaHetu);
        henkiloVanhaHetuCreateDto.setKutsumanimi("Tiina");
        henkiloVanhaHetuCreateDto.setEtunimet("Tiina");
        henkiloVanhaHetuCreateDto.setSukunimi("Testaaja");
        String vanhaOid = henkiloModificationService.createHenkilo(henkiloVanhaHetuCreateDto).getOidHenkilo();

        HenkiloCreateDto henkiloUusiHetuCreateDto = new HenkiloCreateDto();
        henkiloUusiHetuCreateDto.setHetu(uusiHetu);
        henkiloUusiHetuCreateDto.setEtunimet("Tiina");
        henkiloUusiHetuCreateDto.setKutsumanimi("Tiina");
        henkiloUusiHetuCreateDto.setSukunimi("Testaaja");
        String uusiOid = henkiloModificationService.createHenkilo(henkiloUusiHetuCreateDto).getOidHenkilo();

        yksilointiService.yksiloiAutomaattisesti(vanhaOid);
        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        reset(amazonSNS);

        yksilointiService.yliajaHenkilonTiedot(vanhaOid);

        assertPublished(2, uusiOid, vanhaOid);

        reset(amazonSNS);

        yksilointiService.yliajaHenkilonTiedot(uusiOid);

        assertPublished(2, uusiOid, vanhaOid);
        assertThat(henkiloRepository.findByOidHenkilo(vanhaOid)).hasValueSatisfying(henkiloByVanhaOid -> {
            assertThat(henkiloByVanhaOid)
                    .returns(uusiHetu, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 20), Henkilo::getSyntymaaika)
                    .returns("2", Henkilo::getSukupuoli)
                    .returns(vanhaOid, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(true, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(vanhaOid)).containsExactlyInAnyOrder(vanhaHetu, uusiHetu);
        assertThat(henkiloRepository.findByOidHenkilo(uusiOid)).hasValueSatisfying(henkiloByUusiOid -> {
            assertThat(henkiloByUusiOid)
                    .returns(null, Henkilo::getHetu)
                    .returns(LocalDate.of(1998, Month.JANUARY, 20), Henkilo::getSyntymaaika)
                    .returns("2", Henkilo::getSukupuoli)
                    .returns(null, Henkilo::getOppijanumero)
                    .returns(true, Henkilo::isYksilointiYritetty)
                    .returns(false, Henkilo::isYksiloityVTJ);
        });
        assertThat(hetuRepository.findByHenkiloOid(uusiOid)).isEmpty();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void hetuttomanYksilointiJaPuraHeikkoYksilointi() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);

        reset(amazonSNS);

        DateTime modifiedSince = DateTime.now();
        yksilointiService.hetuttomanYksilointi(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getHenkilosByOids(singletonList(henkiloReadDto.getOidHenkilo())).get(0))
                .returns(true, from(HenkiloDto::isYksiloity))
                .returns(false, from(HenkiloDto::isYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(1, henkiloReadDto.getOidHenkilo());

        reset(amazonSNS);

        modifiedSince = DateTime.now();
        yksilointiService.puraHeikkoYksilointi(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getHenkilosByOids(singletonList(henkiloReadDto.getOidHenkilo())).get(0))
                .returns(false, from(HenkiloDto::isYksiloity))
                .returns(false, from(HenkiloDto::isYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(1, henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void enableYksilointiHakemus() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);

        reset(amazonSNS);

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysHakemusDto("hakemusoid123", LocalDate.of(2018, Month.MARCH, 14)));

        List<AsiayhteysHakemus> asiayhteysHakemukset = asiayhteysHakemusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysHakemukset).extracting(AsiayhteysHakemus::getHakemusOid).containsExactly("hakemusoid123");
        assertPublished(1, henkiloReadDto.getOidHenkilo());

        reset(amazonSNS);

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysHakemusDto("hakemusoid123", LocalDate.of(2018, Month.MARCH, 15)));

        asiayhteysHakemukset = asiayhteysHakemusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysHakemukset).extracting(AsiayhteysHakemus::getLoppupaivamaara).containsExactly(LocalDate.of(2018, Month.MARCH, 15));
        assertPublished(1, henkiloReadDto.getOidHenkilo());

        reset(amazonSNS);

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysHakemusDto("hakemusoid321", LocalDate.of(2018, Month.MARCH, 16)));

        asiayhteysHakemukset = asiayhteysHakemusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysHakemukset).extracting(AsiayhteysHakemus::getHakemusOid).containsExactlyInAnyOrder("hakemusoid123", "hakemusoid321");
        assertPublished(1, henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void enableYksilointiKayttooikeus() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);

        reset(amazonSNS);

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysKayttooikeusDto(LocalDate.of(2018, Month.MARCH, 14)));

        Optional<AsiayhteysKayttooikeus> asiayhteysKayttooikeus = asiayhteysKayttooikeusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysKayttooikeus).hasValueSatisfying(t -> assertThat(t.getLoppupaivamaara()).isEqualTo("2018-03-14"));
        assertPublished(1, henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void hetuUpdates() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        henkiloCreateDto.setHetu("190259-817N");
        String yksiloitavaOid = this.henkiloModificationService.createHenkilo(henkiloCreateDto).getOidHenkilo();

        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setEtunimi("teppo");
        yksiloityHenkilo.setKutsumanimi("teppo");
        yksiloityHenkilo.setSukunimi("testaaja");
        yksiloityHenkilo.setHetu("170498-993H");
        when(this.vtjClientMock.fetchHenkilo(eq("190259-817N"))).thenReturn(Optional.of(yksiloityHenkilo));
        reset(amazonSNS);

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        Henkilo henkilo = henkiloService.getEntityByOid(yksiloitavaOid);
        assertThat(henkilo)
                .extracting(Henkilo::getHetu)
                .isEqualTo("170498-993H");
        assertPublished(1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void henkiloAlreadyExistsWithSameHetu() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        henkiloCreateDto.setHetu("190259-855W");
        henkiloCreateDto.setYksiloityVTJ(false);
        String yksiloitavaOid = this.henkiloModificationService.createHenkilo(henkiloCreateDto).getOidHenkilo();

        HenkiloCreateDto henkiloCreateDtoDuplicate = new HenkiloCreateDto();
        henkiloCreateDtoDuplicate.setKutsumanimi("duplikaatti");
        henkiloCreateDtoDuplicate.setEtunimet("duplikaatti");
        henkiloCreateDtoDuplicate.setSukunimi("henkilo");
        henkiloCreateDtoDuplicate.setHetu("170498-993H");
        henkiloCreateDtoDuplicate.setYksiloityVTJ(true);
        String duplikaattiOid = this.henkiloModificationService.createHenkilo(henkiloCreateDtoDuplicate).getOidHenkilo();

        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setEtunimi("teppo");
        yksiloityHenkilo.setKutsumanimi("teppo");
        yksiloityHenkilo.setSukunimi("testaaja");
        yksiloityHenkilo.setHetu("170498-993H");
        when(this.vtjClientMock.fetchHenkilo(eq("190259-855W"))).thenReturn(Optional.of(yksiloityHenkilo));
        reset(amazonSNS);

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        assertThat(henkiloService.getEntityByOid(duplikaattiOid))
                .extracting(henkilo1 -> tuple(henkilo1.getHetu(), henkilo1.isYksiloityVTJ()))
                .isEqualTo(tuple("170498-993H", true));
        assertThat(henkiloService.getEntityByOid(yksiloitavaOid))
                .extracting(henkilo1 -> tuple(henkilo1.getHetu(), henkilo1.isYksiloityVTJ()))
                .isEqualTo(tuple(null, false));
        assertThat(henkiloService.findSlavesByMasterOid(duplikaattiOid))
                .hasSize(1)
                .extracting(HenkiloReadDto::getHetu)
                .containsNull();
        assertThat(henkiloService.findSlavesByMasterOid(yksiloitavaOid)).isEmpty();
        verify(kayttooikeusClientMock).passivoiHenkilo(anyString(), eq("1.2.3.4.5"));
        assertPublished(2, duplikaattiOid, yksiloitavaOid);
    }

    @Test
    public void henkiloAlreadyExistsWithSameHetuAnonymous() {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("1.2.3.4.5", null, "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA"));

        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        henkiloCreateDto.setHetu("190259-817N");
        henkiloCreateDto.setYksiloityVTJ(false);
        String yksiloitavaOid = this.henkiloModificationService.createHenkilo(henkiloCreateDto).getOidHenkilo();

        HenkiloCreateDto henkiloCreateDtoDuplicate = new HenkiloCreateDto();
        henkiloCreateDtoDuplicate.setKutsumanimi("duplikaatti");
        henkiloCreateDtoDuplicate.setEtunimet("duplikaatti");
        henkiloCreateDtoDuplicate.setSukunimi("henkilo");
        henkiloCreateDtoDuplicate.setHetu("170498-993H");
        henkiloCreateDtoDuplicate.setYksiloityVTJ(true);
        String duplikaattiOid = this.henkiloModificationService.createHenkilo(henkiloCreateDtoDuplicate).getOidHenkilo();

        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setEtunimi("teppo");
        yksiloityHenkilo.setKutsumanimi("teppo");
        yksiloityHenkilo.setSukunimi("testaaja");
        yksiloityHenkilo.setHetu("170498-993H");
        when(this.vtjClientMock.fetchHenkilo(eq("190259-817N"))).thenReturn(Optional.of(yksiloityHenkilo));
        reset(amazonSNS);

        SecurityContextHolder.getContext().setAuthentication(null);

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        assertThat(henkiloService.getEntityByOid(duplikaattiOid))
                .extracting(henkilo1 -> tuple(henkilo1.getHetu(), henkilo1.isYksiloityVTJ()))
                .isEqualTo(tuple("170498-993H", true));
        assertThat(henkiloService.getEntityByOid(yksiloitavaOid))
                .extracting(henkilo1 -> tuple(henkilo1.getHetu(), henkilo1.isYksiloityVTJ()))
                .isEqualTo(tuple(null, false));
        assertThat(henkiloService.findSlavesByMasterOid(duplikaattiOid))
                .hasSize(1)
                .extracting(HenkiloReadDto::getHetu)
                .containsNull();
        assertThat(henkiloService.findSlavesByMasterOid(yksiloitavaOid)).isEmpty();
        verify(kayttooikeusClientMock).passivoiHenkilo(anyString(), isNull());
        assertPublished(2, duplikaattiOid, yksiloitavaOid);
    }

    private void assertPublished(int times, String... oids) {
        if (times == 0) {
            verifyZeroInteractions(amazonSNS);
        } else {
            ArgumentCaptor<String> argumentCaptor = ArgumentCaptor.forClass(String.class);
            verify(amazonSNS, times(times)).publish(anyString(), argumentCaptor.capture());
            assertThat(argumentCaptor.getAllValues())
                    .extracting(s -> fromJson(s, new TypeReference<Map<String, String>>() {
                    }).get("oidHenkilo"))
                    .containsOnly(oids);
        }
    }

    private <T> T fromJson(String s, TypeReference<T> t) {
        try {
            return this.objectMapper.readValue(s, t);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
