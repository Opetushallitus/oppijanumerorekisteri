package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.gson.Gson;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ConflictException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.utils.TextUtils;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import nl.altindag.log.LogCaptor;
import org.assertj.core.groups.Tuple;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@Sql("/sql/truncate_data.sql")
public class YksilointiServiceImplTest {

    private final String henkiloOid = "1.2.246.562.24.27470134096";
    @InjectMocks
    private YksilointiServiceImpl yksilointiService;
    @Mock
    private VtjService vtjService;
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
    private final Gson gson = new Gson();
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
        when(duplicateService.linkWithHetu(any(), any()))
                .thenAnswer(invocation -> {
                    Henkilo henkilo = invocation.getArgument(0);
                    return new DuplicateService.LinkResult(henkilo, Collections.singletonList(henkilo), Collections.emptyList());
                });

        String hetu = "010101-123N";
        this.henkilo = EntityUtils.createHenkilo("Teppo Taneli", "Teppo", "Testaaja", hetu, this.henkiloOid,
                false, "fi", "suomi", "246", new Date(), new Date(),
                "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1990, 3, 23));
        when(henkiloRepository.findByOidHenkilo(anyString())).thenReturn(Optional.of(this.henkilo));
    }

    private Optional<YksiloityHenkilo> setUsedFixture(String path) {
        return Optional.ofNullable(gson.fromJson(new InputStreamReader(getClass().getResourceAsStream(path)), YksiloityHenkilo.class));
    }

    @Test
    public void yksiloinninNimivertailuSalliiYksiloinninKunhanYksikinEtunimiOnOikein() {
        Henkilo onr = new Henkilo();
        onr.setEtunimet("Krista Johanna");
        onr.setKutsumanimi("Krista");
        onr.setSukunimi("Virtanen");

        YksiloityHenkilo vtj = new YksiloityHenkilo();
        vtj.setEtunimi("Liisa Johanna");
        vtj.setKutsumanimi(null);
        vtj.setSukunimi("Virtanen");

        assertThat(yksilointiService.tarkistaNimet(onr, vtj, Set.of(vtj.getSukunimi()))).isTrue();
    }

    @Test
    public void puuttuvaaKutsumanimeaEiKorvataYksiloiManuaalisesti() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-kutsumanimi-puuttuu.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getKutsumanimi()).isEqualTo("Teppo");
    }

    @Test
    public void paivitaKutsumanimiYksiloiManuaalisesti() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-uusi-kutsumanimi.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getKutsumanimi()).isEqualTo("Taneli");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void paivitaSyntymaikaYksiloiManuaalisesti() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-ok.json"));
        LocalDate originalSyntymaaika = this.henkilo.getSyntymaaika();
        assertThat(originalSyntymaaika).isEqualTo("1990-03-23");
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        String paivamaara = "1901-01-01";
        assertThat(yksiloity.getSyntymaaika()).isEqualTo(paivamaara);
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void yksiloiPelkallaHetulla() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-ok.json"));
        this.henkilo.setEtunimet(null);
        this.henkilo.setKutsumanimi(null);
        this.henkilo.setSukunimi(null);

        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity).extracting(Henkilo::isYksiloityVTJ).isEqualTo(true);
        verify(this.yksilointitietoRepository, times(0)).save(any());
    }

    @Test(expected = SuspendableIdentificationException.class)
    public void yksiloiVtjError() {

        doReturn(Optional.empty()).when(vtjService).teeHenkiloKysely(any());

        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);

        verify(this.yksilointitietoRepository, times(0)).save(any());
    }

    @Test
    public void yksiloiManuaalisestiPelkallaHetullaJaTyhjillaNimilla() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-ok.json"));
        this.henkilo.setEtunimet("");
        this.henkilo.setKutsumanimi("");
        this.henkilo.setSukunimi("");

        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity).extracting(Henkilo::isYksiloityVTJ).isEqualTo(true);
        verify(this.yksilointitietoRepository, times(0)).save(any());
    }

    @Test
    public void paivitaTurvakieltoYksiloiManuaalisesti() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-ok.json"));
        this.henkilo.setTurvakielto(true);
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getTurvakielto()).isFalse();
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void yksiloiNimetVaarissaKentissa() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-vaarat-kentat.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);

        verify(henkiloModificationService).update(eq(yksiloity));
        assertThat(yksiloity).returns(true, Henkilo::isYksiloityVTJ);
        verify(yksilointitietoRepository, never()).save(any());
    }

    @Test
    public void oppijalleTallentuuVtjYhteystiedot() {
        final String henkiloOid = "yksiloimatonOppija";
        this.henkilo.setOidHenkilo(henkiloOid);
        this.henkilo.setSukunimi("Oppija");
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-oppija.json"));
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
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-virkailija.json"));
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
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-ok.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getSukupuoli()).isEqualTo("1");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void tallennaPuuttuvaSukupuoliHetunPerusteella() {
        this.henkilo.setSukupuoli(null);
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-sukupuoli-puuttuu.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getSukupuoli()).isEqualTo("1");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void kielisyysTallentuu() {
        this.henkilo.setAidinkieli(null);
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-ok.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void huoltajatTallentuvatKorvatenVanhan() {
        this.henkilo.setHuoltajat(Collections.singleton(HenkiloHuoltajaSuhde.builder()
                .huoltaja(Henkilo.builder().oidHenkilo("vanhahuoltaja").build())
                .lapsi(this.henkilo)
                .build()));
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-huoltajat.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        when(henkiloModificationService.createHenkilo(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        when(henkiloModificationService.findOrCreateHuoltaja(any(HuoltajaCreateDto.class), any(Henkilo.class))).thenAnswer((input) -> {
            HuoltajaCreateDto huoltajaCreateDto = input.getArgument(0);
            return Henkilo.builder().hetu(huoltajaCreateDto.getHetu()).etunimet(huoltajaCreateDto.getEtunimet()).sukunimi(huoltajaCreateDto.getSukunimi()).build();
        });

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getHuoltajat().stream().map(HenkiloHuoltajaSuhde::getHuoltaja))
                .extracting(Henkilo::getHetu, Henkilo::getEtunimet, Henkilo::getSukunimi)
                .containsExactlyInAnyOrder(Tuple.tuple("200998-9237", null, null), Tuple.tuple(null, "Tappi Topio", "Testaaja"));
        assertThat(yksiloity.getHuoltajat()).hasSize(2);
        verify(henkiloModificationService).update(eq(yksiloity));
    }

    @Test
    public void lisaaYksilointiTietoKunNimetEivatTasmaa() {
        when(vtjService.teeHenkiloKysely(any())).thenReturn(setUsedFixture("/vtj-testdata/vtj-response-erilaiset-nimet.json"));
        when(henkiloModificationService.update(any(Henkilo.class))).thenAnswer(returnsFirstArg());

        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        verify(henkiloModificationService).update(eq(yksiloity));
        ArgumentCaptor<Yksilointitieto> argumentCaptor = ArgumentCaptor.forClass(Yksilointitieto.class);
        verify(yksilointitietoRepository).save(argumentCaptor.capture());
        Yksilointitieto yksilointitieto = argumentCaptor.getValue();
        assertThat(yksilointitieto).isNotNull().extracting("etunimet").isEqualTo("Teijo Tahvelo");
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
        yksilointitieto.setEtunimet("testi kutsumanimi");
        yksilointitieto.setSukunimi("sukunimi");
        yksilointitieto.setKutsumanimi("kutsumanimi");

        Henkilo henkilo = new Henkilo();

        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(henkilo));
        when(yksilointitietoRepository.findByHenkilo(any())).thenReturn(Optional.of(yksilointitieto));
        yksilointiService.yliajaHenkilonTiedot("");

        assertThat(henkilo.getEtunimet()).isEqualTo("testi kutsumanimi");
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
        yksilointitieto.setEtunimet("etunimet");
        yksilointitieto.setKutsumanimi("kutsumanimi");
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
    public void terminoivaYksilointivirheUudelleenyritysMaaraNull() {
        Date date = new Date();
        when(this.henkiloRepository.findByOidHenkilo(eq("1.2.3.4.5"))).thenReturn(Optional.of(new Henkilo()));
        when(this.yksilointivirheRepository.findByHenkilo(any(Henkilo.class))).thenReturn(Optional.of(Yksilointivirhe
                .builder()
                .uudelleenyritysMaara(5)
                .uudelleenyritysAikaleima(date)
                .build()));

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

    @Test
    public void eiTerminoivaYksilointivirheUudelleenyritysMaaraKasvaa() {
        Date date = new Date();
        when(this.henkiloRepository.findByOidHenkilo(eq("1.2.3.4.5"))).thenReturn(Optional.of(new Henkilo()));
        when(this.yksilointivirheRepository.findByHenkilo(any(Henkilo.class))).thenReturn(Optional.of(Yksilointivirhe
                .builder()
                .uudelleenyritysMaara(5)
                .uudelleenyritysAikaleima(date)
                .build()));

        this.yksilointiService.tallennaYksilointivirhe("1.2.3.4.5", new Exception(""));

        ArgumentCaptor<Yksilointivirhe> yksilointivirheArgumentCaptor = ArgumentCaptor.forClass(Yksilointivirhe.class);
        verify(this.yksilointivirheRepository).save(yksilointivirheArgumentCaptor.capture());
        Yksilointivirhe yksilointivirhe = yksilointivirheArgumentCaptor.getValue();
        assertThat(yksilointivirhe.getUudelleenyritysMaara()).isEqualTo(6);
        assertThat(yksilointivirhe.getUudelleenyritysAikaleima()).isAfter(date);
    }

    @Test
    public void yksilointiVTJNimienNormalisointiToimii() {
        String fromSpecial = TextUtils.normalize("Éva Nõmm Noël Hélène Ðông Bùi");
        String fromNormal = TextUtils.normalize("Eva Nomm Noel Helene Dong Bui");

        assertThat(fromSpecial).isEqualTo(fromNormal);
    }

    @Test(expected = NotFoundException.class)
    public void existsNotFound() {
        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjService.teeHenkiloKysely(any())).thenReturn(Optional.empty());

        yksilointiService.exists(existenceCheckDto());
    }

    @Test
    public void existsInOnr() {
        Henkilo henkilo = mock(Henkilo.class);
        when(henkilo.getOidHenkilo()).thenReturn("test");
        when(henkilo.getEtunimet()).thenReturn("a b c");
        when(henkilo.getKutsumanimi()).thenReturn("b");
        when(henkilo.getSukunimi()).thenReturn("d");

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.of(henkilo));

        assertThat(yksilointiService.exists(existenceCheckDto())).isEqualTo(Optional.of("test"));

        verifyNoInteractions(vtjService);
    }

    @Test(expected = ConflictException.class)
    public void existsInOnrButConflicts() {
        Henkilo henkilo = mock(Henkilo.class);
        when(henkilo.getEtunimet()).thenReturn("very different name");
        when(henkilo.getKutsumanimi()).thenReturn("b");
        when(henkilo.getSukunimi()).thenReturn("d");

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.of(henkilo));

        yksilointiService.exists(existenceCheckDto());
    }

    @Test
    public void existsInVtj() {
        YksiloityHenkilo henkilo = mock(YksiloityHenkilo.class);
        when(henkilo.getEtunimi()).thenReturn("a b c");
        when(henkilo.getKutsumanimi()).thenReturn("b");
        when(henkilo.getSukunimi()).thenReturn("d");

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjService.teeHenkiloKysely(any())).thenReturn(Optional.of(henkilo));

        assertThat(yksilointiService.exists(existenceCheckDto())).isEmpty();
    }

    @Test
    public void existsInVtjButConflicts() {
        LogCaptor logCaptor = LogCaptor.forClass(YksilointiServiceImpl.class);
        logCaptor.clearLogs();
        logCaptor.setLogLevelToInfo();

        YksiloityHenkilo henkilo = mock(YksiloityHenkilo.class);
        when(henkilo.getEtunimi()).thenReturn("very different name");
        when(henkilo.getKutsumanimi()).thenReturn("b");
        when(henkilo.getSukunimi()).thenReturn("d");

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjService.teeHenkiloKysely(any())).thenReturn(Optional.of(henkilo));

        HenkiloExistenceCheckDto details = existenceCheckDto();

        try {
            yksilointiService.exists(details);
            fail("Exception should have been thrown");
        } catch (ConflictException ce) {
            assertThat(logCaptor.getInfoLogs()).isNotEmpty();
            assertThat(logCaptor.getInfoLogs().get(0)).endsWith("VTJ name comparison failed! input: \"a b c, d\" vtj: \"very different name, d\"");
        }
    }

    @Test
    public void existsInVtjWithEmptyNickname() {
        YksiloityHenkilo henkilo = mock(YksiloityHenkilo.class);
        when(henkilo.getEtunimi()).thenReturn("a b c");
        when(henkilo.getKutsumanimi()).thenReturn("");
        when(henkilo.getSukunimi()).thenReturn("d");

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjService.teeHenkiloKysely(any())).thenReturn(Optional.of(henkilo));

        HenkiloExistenceCheckDto details = existenceCheckDto();

        assertThat(yksilointiService.exists(details)).isEmpty();
    }

    @Test
    public void existsInVtjWithNullNickname() {
        YksiloityHenkilo henkilo = mock(YksiloityHenkilo.class);
        when(henkilo.getEtunimi()).thenReturn("a b c");
        when(henkilo.getKutsumanimi()).thenReturn(null);
        when(henkilo.getSukunimi()).thenReturn("d");

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjService.teeHenkiloKysely(any())).thenReturn(Optional.of(henkilo));

        HenkiloExistenceCheckDto details = existenceCheckDto();

        assertThat(yksilointiService.exists(details)).isEmpty();
    }

    private HenkiloExistenceCheckDto existenceCheckDto() {
        return HenkiloExistenceCheckDto.builder()
                .hetu("230668-003A")
                .etunimet("a b c")
                .kutsumanimi("b")
                .sukunimi("d")
                .build();
    }
}
