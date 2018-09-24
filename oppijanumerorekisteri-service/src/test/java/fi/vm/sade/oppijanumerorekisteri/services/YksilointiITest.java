package fi.vm.sade.oppijanumerorekisteri.services;

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
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.joda.time.DateTime;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Optional;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@IntegrationTest
public class YksilointiITest {

    @MockBean
    private VtjClient vtjClientMock;
    @MockBean
    private KayttooikeusClient kayttooikeusClientMock;
    @Autowired
    private DatabaseService databaseService;
    @MockBean
    private OppijaTuontiService oppijaTuontiService;

    @Autowired
    private YksilointiTask yksilointiTask;
    @Autowired
    private YksilointiService yksilointiService;
    @Autowired
    private HenkiloService henkiloService;
    @Autowired
    private HenkiloModificationService henkiloModificationService;
    @Autowired
    private AsiayhteysHakemusRepository asiayhteysHakemusRepository;
    @Autowired
    private AsiayhteysKayttooikeusRepository asiayhteysKayttooikeusRepository;



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

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void enableYksilointiHakemus() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysHakemusDto("hakemusoid123", LocalDate.of(2018, Month.MARCH, 14)));

        List<AsiayhteysHakemus> asiayhteysHakemukset = asiayhteysHakemusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysHakemukset).extracting(AsiayhteysHakemus::getHakemusOid).containsExactly("hakemusoid123");

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysHakemusDto("hakemusoid123", LocalDate.of(2018, Month.MARCH, 15)));

        asiayhteysHakemukset = asiayhteysHakemusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysHakemukset).extracting(AsiayhteysHakemus::getLoppupaivamaara).containsExactly(LocalDate.of(2018, Month.MARCH, 15));

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysHakemusDto("hakemusoid321", LocalDate.of(2018, Month.MARCH, 16)));

        asiayhteysHakemukset = asiayhteysHakemusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysHakemukset).extracting(AsiayhteysHakemus::getHakemusOid).containsExactlyInAnyOrder("hakemusoid123", "hakemusoid321");
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void enableYksilointiKayttooikeus() {
        HenkiloCreateDto henkiloCreateDto = new HenkiloCreateDto();
        henkiloCreateDto.setKutsumanimi("teppo");
        henkiloCreateDto.setEtunimet("teppo");
        henkiloCreateDto.setSukunimi("testaaja");
        HenkiloDto henkiloReadDto = henkiloModificationService.createHenkilo(henkiloCreateDto);

        yksilointiService.enableYksilointi(henkiloReadDto.getOidHenkilo(), new AsiayhteysKayttooikeusDto(LocalDate.of(2018, Month.MARCH, 14)));

        Optional<AsiayhteysKayttooikeus> asiayhteysKayttooikeus = asiayhteysKayttooikeusRepository.findByHenkiloOid(henkiloReadDto.getOidHenkilo());
        assertThat(asiayhteysKayttooikeus).hasValueSatisfying(t -> assertThat(t.getLoppupaivamaara()).isEqualTo("2018-03-14"));
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        Henkilo henkilo = henkiloService.getEntityByOid(yksiloitavaOid);
        assertThat(henkilo)
                .extracting(Henkilo::getHetu)
                .contains("170498-993H");
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
        this.henkiloModificationService.createHenkilo(henkiloCreateDtoDuplicate);

        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setEtunimi("teppo");
        yksiloityHenkilo.setKutsumanimi("teppo");
        yksiloityHenkilo.setSukunimi("testaaja");
        yksiloityHenkilo.setHetu("170498-993H");
        when(this.vtjClientMock.fetchHenkilo(eq("190259-855W"))).thenReturn(Optional.of(yksiloityHenkilo));

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        Henkilo henkilo = henkiloService.getEntityByOid(yksiloitavaOid);
        assertThat(henkilo)
                .extracting(henkilo1 -> tuple(henkilo1.getHetu(), henkilo1.isYksiloityVTJ()))
                .contains(tuple("170498-993H", true));
        List<HenkiloReadDto> slaves = this.henkiloService.findSlavesByMasterOid(yksiloitavaOid);
        assertThat(slaves)
                .hasSize(1)
                .extracting(HenkiloReadDto::getHetu)
                .containsNull();
        verify(kayttooikeusClientMock).passivoiHenkilo(anyString(), eq("1.2.3.4.5"));
    }

    @Test
    public void henkiloAlreadyExistsWithSameHetuAnonymous() {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("1.2.3.4.5", null, "APP_HENKILONHALLINTA_OPHREKISTERI"));

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
        this.henkiloModificationService.createHenkilo(henkiloCreateDtoDuplicate);

        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setEtunimi("teppo");
        yksiloityHenkilo.setKutsumanimi("teppo");
        yksiloityHenkilo.setSukunimi("testaaja");
        yksiloityHenkilo.setHetu("170498-993H");
        when(this.vtjClientMock.fetchHenkilo(eq("190259-817N"))).thenReturn(Optional.of(yksiloityHenkilo));

        SecurityContextHolder.getContext().setAuthentication(null);

        this.yksilointiService.yksiloiAutomaattisesti(yksiloitavaOid);

        Henkilo henkilo = henkiloService.getEntityByOid(yksiloitavaOid);
        assertThat(henkilo)
                .extracting(henkilo1 -> tuple(henkilo1.getHetu(), henkilo1.isYksiloityVTJ()))
                .contains(tuple("170498-993H", true));
        List<HenkiloReadDto> slaves = this.henkiloService.findSlavesByMasterOid(yksiloitavaOid);
        assertThat(slaves)
                .hasSize(1)
                .extracting(HenkiloReadDto::getHetu)
                .containsNull();
        verify(kayttooikeusClientMock).passivoiHenkilo(anyString(), isNull());
    }
}