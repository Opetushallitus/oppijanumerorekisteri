package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.YksilointiServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.AdditionalAnswers;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.*;

public class YksilointiServiceTest {
    private MockVtjClient vtjClient;

    private YksilointiService yksilointiService;

    private final String henkiloOid = "1.2.246.562.24.27470134096";
    private Henkilo henkilo;

    @Before
    public void setup() {
        this.vtjClient = new MockVtjClient();
        MockKoodistoClient mockKoodistoClient = new MockKoodistoClient();
        OppijanumerorekisteriProperties oppijanumerorekisteriProperties = new OppijanumerorekisteriProperties();

        HenkiloRepository henkiloRepository = mock(HenkiloRepository.class);
        YksilointitietoRepository yksilointitietoRepository = mock(YksilointitietoRepository.class);
        KansalaisuusRepository kansalaisuusRepository = mock(KansalaisuusRepository.class);
        KielisyysRepository kielisyysRepository = mock(KielisyysRepository.class);
        YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository = mock(YhteystiedotRyhmaRepository.class);
        YhteystietoRepository yhteystietoRepository = mock(YhteystietoRepository.class);

        this.yksilointiService = new YksilointiServiceImpl(henkiloRepository, yksilointitietoRepository,
                this.vtjClient, mockKoodistoClient, oppijanumerorekisteriProperties, kansalaisuusRepository,
                kielisyysRepository, yhteystiedotRyhmaRepository, yhteystietoRepository);

        when(kielisyysRepository.findByKieliKoodi(anyString()))
                .thenReturn(Optional.of(EntityUtils.createKielisyys("fi", "suomi")));
        doAnswer(AdditionalAnswers.returnsFirstArg()).when(kielisyysRepository).save(any(Kielisyys.class));
        when(kansalaisuusRepository.findOrCreate(anyString()))
                .thenReturn(EntityUtils.createKansalaisuus("246"));

        String hetu = "010101-123N";
        this.henkilo = EntityUtils.createHenkilo("Teppo Taneli", "Teppo", "Testaaja", hetu, this.henkiloOid,
                false, HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(),
                "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1990, 3, 23));
        when(henkiloRepository.findByOidHenkilo(anyString())).thenReturn(Optional.of(this.henkilo));
    }

    @Test
    public void puuttuvaaKutsumanimeaEiKorvataYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-kutsumanimi-puuttuu.json");

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getKutsumanimi()).isEqualTo("Teppo");
    }

    @Test
    public void paivitaKutsumanimiYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-uusi-kutsumanimi.json");
        Date before = new Date();

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getKutsumanimi()).isEqualTo("Taneli");
        assertThat(yksiloity.getModified()).isAfter(before);
    }

    @Test
    public void paivitaSyntymaikaYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        Date before = new Date();
        LocalDate originalSyntymaaika = this.henkilo.getSyntymaaika();
        assertThat(originalSyntymaaika).isEqualTo("1990-03-23");

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        String paivamaara = "1901-01-01";
        assertThat(yksiloity.getSyntymaaika()).isEqualTo(paivamaara);
        assertThat(yksiloity.getModified()).isAfter(before);
    }

    @Test
    public void paivitaTurvakieltoYksiloiManuaalisesti() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        this.henkilo.setTurvakielto(true);

        Date before = new Date();
        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(this.henkiloOid);
        assertThat(yksiloity.getTurvakielto()).isFalse();
        assertThat(yksiloity.getModified()).isAfter(before);
    }

    @Test
    public void oppijalleTallentuuVtjYhteystiedot() {
        final String henkiloOid = "yksiloimatonOppija";
        this.henkilo.setOidHenkilo(henkiloOid);
        this.henkilo.setSukunimi("Oppija");
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-oppija.json");

        Date before = new Date();
        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getModified()).isAfter(before);
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
        this.henkilo.setHenkiloTyyppi(HenkiloTyyppi.VIRKAILIJA);
        this.henkilo.setYksiloity(false);
        this.henkilo.setYksiloityVTJ(false);
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-virkailija.json");
        Date before = new Date();

        Henkilo yksiloity = this.yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getModified()).isAfter(before);
        assertThat(yksiloity.isYksiloityVTJ()).isTrue();
        assertThat(yksiloity.getYhteystiedotRyhma())
                .extracting("ryhmaAlkuperaTieto")
                .doesNotContain(YksilointiServiceImpl.RYHMAALKUPERA_VTJ);
    }

    @Test
    public void paivitaSukupuoli() {
        this.henkilo.setSukupuoli("2");
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");

        Date before = new Date();
        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getSukupuoli()).isEqualTo("1");
        assertThat(yksiloity.getModified()).isAfter(before);
    }

    @Test
    public void tallennaPuuttuvaSukupuoliHetunPerusteella() {
        this.henkilo.setSukupuoli(null);
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-sukupuoli-puuttuu.json");

        Date before = new Date();
        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getSukupuoli()).isEqualTo("1");
        assertThat(yksiloity.getModified()).isAfter(before);
    }

    @Test
    public void kielisyysTallentuu() {
        this.henkilo.setAidinkieli(null);
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        Date before = new Date();
        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(yksiloity.getModified()).isAfter(before);
    }

    @Test
    public void lisaaYksilointiTietoKunNimetEivatTasmaa() {
        vtjClient.setUsedFixture("/vtj-testdata/vtj-response-erilaiset-nimet.json");
        Date before = new Date();
        Henkilo yksiloity = yksilointiService.yksiloiManuaalisesti(henkiloOid);
        assertThat(yksiloity.getModified()).isAfter(before);
        assertThat(yksiloity.getYksilointitieto()).isNotNull().extracting("etunimet").contains("Teijo Tahvelo");
        assertThat(yksiloity.getEtunimet()).isEqualTo("Teppo Taneli");
    }

}