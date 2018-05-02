package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.YksilointiServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.AdditionalAnswers;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class YksilointiServiceTest {
    private MockVtjClient vtjClient;

    private YksilointiService yksilointiService;

    private HenkiloRepository henkiloRepository;

    private HenkiloService henkiloService;

    private HenkiloModificationService henkiloModificationService;

    private YksilointitietoRepository yksilointitietoRepository;

    private YksilointivirheRepository yksilointivirheRepository;

    private KayttooikeusClient kayttooikeusClientMock;

    private final String henkiloOid = "1.2.246.562.24.27470134096";
    private Henkilo henkilo;

    @Before
    public void setup() {
        this.vtjClient = new MockVtjClient();
        MockKoodistoClient mockKoodistoClient = new MockKoodistoClient();
        kayttooikeusClientMock = mock(KayttooikeusClient.class);
        OppijanumerorekisteriProperties oppijanumerorekisteriProperties = new OppijanumerorekisteriProperties();

        henkiloRepository = mock(HenkiloRepository.class);
        henkiloService = mock(HenkiloService.class);
        henkiloModificationService = mock(HenkiloModificationService.class);
        yksilointitietoRepository = mock(YksilointitietoRepository.class);
        yksilointivirheRepository = mock(YksilointivirheRepository.class);
        KielisyysRepository kielisyysRepository = mock(KielisyysRepository.class);
        KansalaisuusRepository kansalaisuusRepository = mock(KansalaisuusRepository.class);
        this.yksilointiService = new YksilointiServiceImpl(mock(DuplicateService.class),
                henkiloRepository,
                henkiloService,
                henkiloModificationService,
                kansalaisuusRepository,
                kielisyysRepository,
                mock(YhteystiedotRyhmaRepository.class),
                mock(YhteystietoRepository.class),
                yksilointitietoRepository,
                yksilointivirheRepository,
                mock(AsiayhteysPalveluRepository.class),
                mock(AsiayhteysHakemusRepository.class),
                mock(AsiayhteysKayttooikeusRepository.class),
                mock(OrikaConfiguration.class),
                this.vtjClient,
                mockKoodistoClient,
                kayttooikeusClientMock,
                oppijanumerorekisteriProperties);

        when(kielisyysRepository.findByKieliKoodi(anyString()))
                .thenReturn(Optional.of(EntityUtils.createKielisyys("fi", "suomi")));
        doAnswer(AdditionalAnswers.returnsFirstArg()).when(kielisyysRepository).save(any(Kielisyys.class));
        when(kansalaisuusRepository.findOrCreate(anyString()))
                .thenReturn(EntityUtils.createKansalaisuus("246"));

        String hetu = "010101-123N";
        this.henkilo = EntityUtils.createHenkilo("Teppo Taneli", "Teppo", "Testaaja", hetu, this.henkiloOid,
                false, "fi", "suomi", "246", new Date(), new Date(),
                "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1990, 3, 23));
        when(henkiloRepository.findByOidHenkilo(anyString())).thenReturn(Optional.of(this.henkilo));
    }

    @Test
    public void puuttuvaaKutsumanimeaEiKorvataYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-kutsumanimi-puuttuu.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getKutsumanimi()).isEqualTo("Teppo");
    }

    @Test
    public void paivitaKutsumanimiYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-uusi-kutsumanimi.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getKutsumanimi()).isEqualTo("Taneli");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void paivitaSyntymaikaYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        LocalDate originalSyntymaaika = this.henkilo.getSyntymaaika();
        assertThat(originalSyntymaaika).isEqualTo("1990-03-23");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        String paivamaara = "1901-01-01";
        assertThat(yksiloity.getSyntymaaika()).isEqualTo(paivamaara);
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void paivitaTurvakieltoYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        this.henkilo.setTurvakielto(true);
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getTurvakielto()).isFalse();
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void oppijalleTallentuuVtjYhteystiedot() {
        final String henkiloOid = "yksiloimatonOppija";
        this.henkilo.setOidHenkilo(henkiloOid);
        this.henkilo.setSukunimi("Oppija");
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-oppija.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
        verify(henkiloModificationService).update(eq(yksiloity));
        assertThat(yksiloity.isYksiloityVTJ()).isTrue();
        assertThat(yksiloity.getYhteystiedotRyhma())
                .extracting("ryhmaAlkuperaTieto")
                .contains(YksilointiServiceImpl.RYHMAALKUPERA_VTJ);

    }

    @Test
    public void virkailijalleEiTallennuVtjYhteystiedot() {
        final String henkiloOid = "yksiloimatonVirkailija";
        this.henkilo.setOidHenkilo(henkiloOid);
        this.henkilo.setSukunimi("Virkailija");
        this.henkilo.setYksiloity(false);
        this.henkilo.setYksiloityVTJ(false);
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-virkailija.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        KayttajaReadDto dto = new KayttajaReadDto();
        dto.setOid(henkiloOid);
        dto.setKayttajaTyyppi("VIRKAILIJA");
        when(kayttooikeusClientMock.getKayttajaByOid(any())).thenReturn(Optional.of(dto));

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
        verify(henkiloModificationService).update(eq(yksiloity));
        assertThat(yksiloity.isYksiloityVTJ()).isTrue();
        assertThat(yksiloity.getYhteystiedotRyhma())
                .extracting("ryhmaAlkuperaTieto")
                .doesNotContain(YksilointiServiceImpl.RYHMAALKUPERA_VTJ);
    }

    @Test
    public void paivitaSukupuoli() {
        this.henkilo.setSukupuoli("2");
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getSukupuoli()).isEqualTo("1");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void tallennaPuuttuvaSukupuoliHetunPerusteella() {
        this.henkilo.setSukupuoli(null);
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-sukupuoli-puuttuu.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getSukupuoli()).isEqualTo("1");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void kielisyysTallentuu() {
        this.henkilo.setAidinkieli(null);
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void lisaaYksilointiTietoKunNimetEivatTasmaa() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-erilaiset-nimet.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        verify(henkiloModificationService).update(eq(yksiloity));
        ArgumentCaptor<Yksilointitieto> argumentCaptor = ArgumentCaptor.forClass(Yksilointitieto.class);
        verify(yksilointitietoRepository).save(argumentCaptor.capture());
        Yksilointitieto yksilointitieto = argumentCaptor.getValue();
        assertThat(yksilointitieto).isNotNull().extracting("etunimet").contains("Teijo Tahvelo");
        assertThat(yksiloity.getEtunimet()).isEqualTo("Teppo Taneli");
    }

    @Test
    public void hetuttomanYksilointiOnnistuu() {
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        this.henkilo.setHetu(null);

        Henkilo hlo = yksilointiService.hetuttomanYksilointi(this.henkiloOid);
        assertThat(hlo.getHetu()).isNullOrEmpty();
        assertThat(hlo.isYksiloity()).isTrue();
        verify(henkiloModificationService).update(eq(hlo));
        assertThat(hlo.isDuplicate()).isFalse();
        assertThat(hlo.getOppijanumero()).isEqualTo(henkiloOid);
    }

    @Test
    public void hetuttomanYksiloinninPurkaminenOnnistuu() {
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        this.henkilo.setHetu(null);
        yksilointiService.hetuttomanYksilointi(henkiloOid);

        Henkilo purettu = yksilointiService.puraHeikkoYksilointi(henkiloOid);
        assertThat(purettu.isYksiloity()).isFalse();
        verify(henkiloModificationService, times(2)).update(eq(purettu));
    }

    @Test
    public void yliajaHenkiloTiedotOnnistuuPerustietojenOsalta() {
        Yksilointitieto yksilointitieto = new Yksilointitieto();
        yksilointitieto.setEtunimet("testi");
        yksilointitieto.setSukunimi("sukunimi");
        yksilointitieto.setKutsumanimi("kutsumanimi");

        Henkilo henkilo = new Henkilo();

        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(henkilo));
        when(yksilointitietoRepository.findByHenkilo(any())).thenReturn(Optional.of(yksilointitieto));
        yksilointiService.yliajaHenkilonTiedot("");

        assertThat(henkilo.getEtunimet()).isEqualTo("testi");
        assertThat(henkilo.getSukunimi()).isEqualTo("sukunimi");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("kutsumanimi");
        assertThat(henkilo.isYksiloityVTJ()).isTrue();
        assertThat(henkilo.isYksiloity()).isFalse();
        verify(yksilointitietoRepository).delete(eq(yksilointitieto));
        verify(henkiloModificationService).update(eq(henkilo));
    }

    @Test
    public void yliajaHenkiloTiedotOnnistuuYhteystietoRyhmienOsalta() {
        Yksilointitieto yksilointitieto = new Yksilointitieto();
        Henkilo henkilo = new Henkilo();

        YhteystiedotRyhma yhteystiedotRyhma1 = new YhteystiedotRyhma();
        henkilo.getYhteystiedotRyhma().add(yhteystiedotRyhma1);

        YhteystiedotRyhma yhteystiedotRyhma2 = new YhteystiedotRyhma();
        YhteystiedotRyhma yhteystiedotRyhma3 = new YhteystiedotRyhma();
        yksilointitieto.getYhteystiedotRyhma().add(yhteystiedotRyhma2);
        yksilointitieto.getYhteystiedotRyhma().add(yhteystiedotRyhma3);

        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(henkilo));
        when(yksilointitietoRepository.findByHenkilo(any())).thenReturn(Optional.of(yksilointitieto));
        yksilointiService.yliajaHenkilonTiedot("");

        assertThat(henkilo.getYhteystiedotRyhma().size()).isEqualTo(3);
        verify(henkiloModificationService).update(eq(henkilo));
    }


}