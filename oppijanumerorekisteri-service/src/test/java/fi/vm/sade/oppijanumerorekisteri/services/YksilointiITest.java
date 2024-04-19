package fi.vm.sade.oppijanumerorekisteri.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HetuRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.rajapinnat.vtj.api.Huoltaja;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import software.amazon.awssdk.services.sns.SnsClient;

import org.joda.time.DateTime;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.time.Month;
import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.AssertPublished.assertPublished;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@IntegrationTest
public class YksilointiITest {

    @MockBean
    private VtjClient vtjClientMock;
    @MockBean
    private KayttooikeusClient kayttooikeusClientMock;
    @MockBean
    private SnsClient snsClient;
    @Autowired
    private DatabaseService databaseService;
    @MockBean
    private OppijaTuontiService oppijaTuontiService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private YksilointiService yksilointiService;
    @Autowired
    private IdentificationService identificationService;
    @Autowired
    private HenkiloService henkiloService;
    @Autowired
    private HenkiloModificationService henkiloModificationService;
    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private HetuRepository hetuRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

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

        reset(snsClient);

        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        assertPublished(objectMapper, snsClient, 1, uusiOid);

        HenkiloCreateDto henkiloVanhaHetuCreateDto = new HenkiloCreateDto();
        henkiloVanhaHetuCreateDto.setHetu(vanhaHetu);
        henkiloVanhaHetuCreateDto.setKutsumanimi("Teppo");
        henkiloVanhaHetuCreateDto.setEtunimet("Teppo");
        henkiloVanhaHetuCreateDto.setSukunimi("Testaaja");
        String vanhaOid = henkiloModificationService.createHenkilo(henkiloVanhaHetuCreateDto).getOidHenkilo();

        reset(snsClient);

        yksilointiService.yksiloiAutomaattisesti(vanhaOid);

        assertPublished(objectMapper, snsClient, 2, uusiOid, vanhaOid);
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

        reset(snsClient);

        yksilointiService.yksiloiAutomaattisesti(vanhaOid);

        assertPublished(objectMapper, snsClient, 2, uusiOid, vanhaOid);

        reset(snsClient);

        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        assertPublished(objectMapper, snsClient, 0);
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
    public void yksiloiAutomaattisestiLisaaUudenHuoltajan() {
        String huoltajaHetu = "190198-5259";
        String huollettavaHetu = "200198-7484";

        HenkiloCreateDto onrHuollettava = new HenkiloCreateDto();
        onrHuollettava.setHetu(huollettavaHetu);
        onrHuollettava.setEtunimet("Teppo Huollettava");
        onrHuollettava.setKutsumanimi("Teppo Huollettava");
        onrHuollettava.setSukunimi("Testaaja");
        String huollettavaOid = henkiloModificationService.createHenkilo(onrHuollettava).getOidHenkilo();

        YksiloityHenkilo vtjHuollettava = new YksiloityHenkilo();
        vtjHuollettava.setHetu(huollettavaHetu);
        vtjHuollettava.setEtunimi("Teppo Huollettava");
        vtjHuollettava.setKutsumanimi("Huollettava");
        vtjHuollettava.setSukunimi("Testaaja");
        vtjHuollettava.setHuoltajat(singletonList(new Huoltaja() {{
            setHetu(huoltajaHetu);
            setEtunimi("Seppo Huoltaja");
            setSukunimi("Testaaja");
        }}));
        when(vtjClientMock.fetchHenkilo(anyString())).thenReturn(Optional.of(vtjHuollettava));

        yksilointiService.yksiloiAutomaattisesti(huollettavaOid);

        assertThat(henkiloRepository.findAll())
                .extracting(Henkilo::getHetu, Henkilo::getEtunimet, Henkilo::getKutsumanimi, Henkilo::getSukunimi, Henkilo::isYksiloityVTJ)
                .containsExactlyInAnyOrder(
                        tuple(huollettavaHetu, "Teppo Huollettava", "Huollettava", "Testaaja", true),
                        tuple(huoltajaHetu, "Seppo Huoltaja", "Seppo Huoltaja", "Testaaja", false));
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
        identificationService.yksilointiTask();

        assertThat(henkiloService.getByHetu(hetu))
                .returns("Teppo", from(HenkiloReadDto::getEtunimet))
                .returns(true, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());

        reset(snsClient);

        modifiedSince = DateTime.now();
        yksilointiService.paivitaYksilointitiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(objectMapper, snsClient, 1, henkiloReadDto.getOidHenkilo());
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
        identificationService.yksilointiTask();

        assertThat(henkiloService.getByHetu(hetu))
                .returns("teppo", from(HenkiloReadDto::getEtunimet))
                .returns(false, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());

        reset(snsClient);

        modifiedSince = DateTime.now();
        yksilointiService.yliajaHenkilonTiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getByHetu(hetu))
                .returns("Esa", from(HenkiloReadDto::getEtunimet))
                .returns(true, from(HenkiloReadDto::getYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(objectMapper, snsClient, 1, henkiloReadDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yliajaHenkilonTiedotUusiHetuNull() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        henkiloModificationService.createHenkilo(henkiloCreateDto);
        henkiloCreateDto.setHetu("190198-727T");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu(null);
        yksiloityHenkilo.setKutsumanimi("Esa");
        yksiloityHenkilo.setEtunimi("Esa");
        yksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(any())).thenReturn(Optional.of(yksiloityHenkilo));

        yksilointiService.yksiloiAutomaattisesti(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getByHetu(henkiloReadDto.getHetu()))
                .returns("teppo", from(HenkiloReadDto::getEtunimet))
                .returns(false, from(HenkiloReadDto::getYksiloityVTJ));

        yksilointiService.yliajaHenkilonTiedot(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getByHetu(henkiloReadDto.getHetu()))
                .returns("Esa", from(HenkiloReadDto::getEtunimet))
                .returns(true, from(HenkiloReadDto::getYksiloityVTJ));
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

        reset(snsClient);

        yksilointiService.yliajaHenkilonTiedot(vanhaOid);

        assertPublished(objectMapper, snsClient, 2, uusiOid, vanhaOid);
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
    public void yliajaHenkilonTiedotVanhaHetuLisattyYksilointiYrityksenJalkeen() {
        String uusiHetu = "200198-7484";
        YksiloityHenkilo uusiYksiloityHenkilo = new YksiloityHenkilo();
        uusiYksiloityHenkilo.setHetu(uusiHetu);
        uusiYksiloityHenkilo.setKutsumanimi("Teppo");
        uusiYksiloityHenkilo.setEtunimi("Teppo");
        uusiYksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(eq(uusiHetu))).thenReturn(Optional.of(uusiYksiloityHenkilo));
        HenkiloCreateDto henkiloUusiHetuCreateDto = new HenkiloCreateDto();
        henkiloUusiHetuCreateDto.setHetu(uusiHetu);
        henkiloUusiHetuCreateDto.setKutsumanimi("Teppo");
        henkiloUusiHetuCreateDto.setEtunimet("Teppo");
        henkiloUusiHetuCreateDto.setSukunimi("Testaaja");
        String uusiOid = henkiloModificationService.createHenkilo(henkiloUusiHetuCreateDto).getOidHenkilo();
        yksilointiService.yksiloiAutomaattisesti(uusiOid);

        String vanhaHetu = "190198-5259";
        YksiloityHenkilo vanhaYksiloityHenkilo = new YksiloityHenkilo();
        vanhaYksiloityHenkilo.setHetu(vanhaHetu);
        vanhaYksiloityHenkilo.setKutsumanimi("Teppo");
        vanhaYksiloityHenkilo.setEtunimi("Teppo");
        vanhaYksiloityHenkilo.setSukunimi("Testaaja");
        when(vtjClientMock.fetchHenkilo(eq(vanhaHetu))).thenReturn(Optional.of(vanhaYksiloityHenkilo));
        HenkiloCreateDto henkiloVanhaHetuCreateDto = new HenkiloCreateDto();
        henkiloVanhaHetuCreateDto.setHetu(vanhaHetu);
        henkiloVanhaHetuCreateDto.setKutsumanimi("Tiina");
        henkiloVanhaHetuCreateDto.setEtunimet("Tiina");
        henkiloVanhaHetuCreateDto.setSukunimi("Testaaja");
        String vanhaOid = henkiloModificationService.createHenkilo(henkiloVanhaHetuCreateDto).getOidHenkilo();
        yksilointiService.yksiloiAutomaattisesti(vanhaOid);

        jdbcTemplate.update("INSERT INTO henkilo_hetu SELECT id, ? FROM henkilo WHERE oidhenkilo = ?", vanhaHetu, uusiOid);

        reset(snsClient);

        yksilointiService.yliajaHenkilonTiedot(vanhaOid);

        assertPublished(objectMapper, snsClient, 2, uusiOid, vanhaOid);
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

        reset(snsClient);

        yksilointiService.yliajaHenkilonTiedot(vanhaOid);

        assertPublished(objectMapper, snsClient, 2, uusiOid, vanhaOid);

        reset(snsClient);

        yksilointiService.yliajaHenkilonTiedot(uusiOid);

        assertPublished(objectMapper, snsClient, 2, uusiOid, vanhaOid);
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

        reset(snsClient);

        DateTime modifiedSince = DateTime.now();
        yksilointiService.hetuttomanYksilointi(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getHenkilosByOids(singletonList(henkiloReadDto.getOidHenkilo())).get(0))
                .returns(true, from(HenkiloDto::isYksiloity))
                .returns(false, from(HenkiloDto::isYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(objectMapper, snsClient, 1, henkiloReadDto.getOidHenkilo());

        reset(snsClient);

        modifiedSince = DateTime.now();
        yksilointiService.puraHeikkoYksilointi(henkiloReadDto.getOidHenkilo());

        assertThat(henkiloService.getHenkilosByOids(singletonList(henkiloReadDto.getOidHenkilo())).get(0))
                .returns(false, from(HenkiloDto::isYksiloity))
                .returns(false, from(HenkiloDto::isYksiloityVTJ));
        assertThat(henkiloService.findHenkiloOidsModifiedSince(new HenkiloCriteria(), modifiedSince, 0, 2))
                .containsExactly(henkiloReadDto.getOidHenkilo());
        assertPublished(objectMapper, snsClient, 1, henkiloReadDto.getOidHenkilo());
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
        reset(snsClient);

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        Henkilo henkilo = henkiloService.getEntityByOid(yksiloitavaOid);
        assertThat(henkilo)
                .extracting(Henkilo::getHetu)
                .isEqualTo("170498-993H");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
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
        reset(snsClient);

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
        assertPublished(objectMapper, snsClient, 2, duplikaattiOid, yksiloitavaOid);
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
        reset(snsClient);

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
        assertPublished(objectMapper, snsClient, 2, duplikaattiOid, yksiloitavaOid);
    }
}
