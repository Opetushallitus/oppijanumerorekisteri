package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.YksilointiServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
public class YksilointiServiceTest {
    @Spy
    private MockVtjClient vtjClient = new MockVtjClient();

    @InjectMocks
    private YksilointiServiceImpl yksilointiService;

    @Mock
    private HenkiloRepository henkiloRepository;

    @Mock
    private HenkiloService henkiloService;

    @Mock
    private HenkiloModificationService henkiloModificationService;

    @Mock
    private KoodistoService koodistoService;

    @Mock
    private YksilointitietoRepository yksilointitietoRepository;

    @Mock
    private YksilointivirheRepository yksilointivirheRepository;

    @Mock
    private KayttooikeusClient kayttooikeusClientMock;

    @Mock
    private KielisyysRepository kielisyysRepository;

    @Mock
    private KansalaisuusRepository kansalaisuusRepository;

    @Spy
    private OppijanumerorekisteriProperties oppijanumerorekisteriProperties = new OppijanumerorekisteriProperties();

    @Mock
    private OrikaConfiguration orikaConfiguration;

    @Mock
    private DuplicateService duplicateService;

    private final String henkiloOid = "1.2.246.562.24.27470134096";
    private Henkilo henkilo;

    @Before
    public void setup() {
        when(koodistoService.list(eq(Koodisto.KIELI)))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("FI").koodi("SV").build());
        when(kielisyysRepository.findOrCreateByKoodi(anyString()))
                .thenAnswer(invocation -> new Kielisyys(invocation.getArgument(0)));
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
    public void huoltajatTallentuvatKorvatenVanhan() {
        this.henkilo.setHuoltajat(Collections.singleton(Henkilo.builder().oidHenkilo("vanhahuoltaja").build()));
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-huoltajat.json");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        when(henkiloModificationService.createHenkilo(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getHuoltajat())
                .extracting(Henkilo::getHetu)
                .containsExactlyInAnyOrder("tarjanhetu", "tapinhetu");
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

    @Test
    public void terminoivaYksilointivirheEiUudelleenyriteta() {
        when(this.henkiloRepository.findByOidHenkilo(eq("1.2.3.4.5"))).thenReturn(Optional.of(new Henkilo()));
        this.yksilointiService.tallennaYksilointivirhe("1.2.3.4.5", new SuspendableIdentificationException(""));

        ArgumentCaptor<Yksilointivirhe> yksilointivirheArgumentCaptor = ArgumentCaptor.forClass(Yksilointivirhe.class);
        verify(this.yksilointivirheRepository).save(yksilointivirheArgumentCaptor.capture());
        Yksilointivirhe yksilointivirhe = yksilointivirheArgumentCaptor.getValue();
        assertThat(yksilointivirhe.getUudelleenyritysMaara()).isNull();
        assertThat(yksilointivirhe.getUudelleenyritysAikaleima()).isNull();
    }

    @Test
    public void eiTerminoivaYksilointivirheUudelleenyritetaan() {
        when(this.henkiloRepository.findByOidHenkilo(eq("1.2.3.4.5"))).thenReturn(Optional.of(new Henkilo()));
        this.yksilointiService.tallennaYksilointivirhe("1.2.3.4.5", new Exception(""));

        ArgumentCaptor<Yksilointivirhe> yksilointivirheArgumentCaptor = ArgumentCaptor.forClass(Yksilointivirhe.class);
        verify(this.yksilointivirheRepository).save(yksilointivirheArgumentCaptor.capture());
        Yksilointivirhe yksilointivirhe = yksilointivirheArgumentCaptor.getValue();
        assertThat(yksilointivirhe.getUudelleenyritysMaara()).isEqualTo(0);
        assertThat(yksilointivirhe.getUudelleenyritysAikaleima()).isAfter(new Date());
    }
}
