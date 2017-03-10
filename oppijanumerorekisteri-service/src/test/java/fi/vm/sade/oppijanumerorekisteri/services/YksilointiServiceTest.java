package fi.vm.sade.oppijanumerorekisteri.services;

import com.google.common.collect.Sets;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.YksilointiServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.AdditionalAnswers;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.beans.HasPropertyWithValue.hasProperty;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.contains;
import static org.mockito.Mockito.*;

public class YksilointiServiceTest {
    private MockVtjClient vtjClient;

    private HenkiloRepository henkiloRepository;
    private YksilointitietoRepository yksilointitietoRepository;
    private KansalaisuusRepository kansalaisuusRepository;
    private KielisyysRepository kielisyysRepository;
    private YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository;
    private YhteystietoRepository yhteystietoRepository;

    private YksilointiService yksilointiService;

    private final String henkiloOid = "1.2.246.562.24.27470134096";
    private Henkilo henkilo;

    private final String yksiloimatonOid = "yksiloimatonOid";
    private final String hetu = "010101-123N";
    private final String paivamaara = "1901-01-01";
    private final String kasittelija = "jeppis";

    @Before
    public void setup() {
        this.vtjClient = new MockVtjClient();
        MockKoodistoClient mockKoodistoClient = new MockKoodistoClient();
        OppijanumerorekisteriProperties oppijanumerorekisteriProperties = new OppijanumerorekisteriProperties();

        this.henkiloRepository = mock(HenkiloRepository.class);
        this.yksilointitietoRepository = mock(YksilointitietoRepository.class);
        this.kansalaisuusRepository = mock(KansalaisuusRepository.class);
        this.kielisyysRepository = mock(KielisyysRepository.class);
        this.yhteystiedotRyhmaRepository = mock(YhteystiedotRyhmaRepository.class);
        this.yhteystietoRepository = mock(YhteystietoRepository.class);

        this.yksilointiService = new YksilointiServiceImpl(this.henkiloRepository, this.yksilointitietoRepository,
                this.vtjClient, mockKoodistoClient, oppijanumerorekisteriProperties, this.kansalaisuusRepository,
                this.kielisyysRepository, this.yhteystiedotRyhmaRepository, this.yhteystietoRepository);

        when(this.kielisyysRepository.findByKieliKoodi(anyString()))
                .thenReturn(Optional.of(EntityUtils.createKielisyys("fi", "suomi")));
        doAnswer(AdditionalAnswers.returnsFirstArg()).when(this.kielisyysRepository).save(any(Kielisyys.class));
        when(this.kansalaisuusRepository.findOrCreate(anyString()))
                .thenReturn(EntityUtils.createKansalaisuus("246"));

        this.henkilo = EntityUtils.createHenkilo("Teppo Taneli", "Teppo", "Testaaja", "010101-123N", this.henkiloOid,
                false, HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(),
                "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1990, 3, 23));
        when(this.henkiloRepository.findByOidHenkilo(anyString())).thenReturn(Optional.of(this.henkilo));
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
        assertThat(yksiloity.getSyntymaaika()).isEqualTo(this.paivamaara);
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
    public void testOppijalleTallentuuVtjYhteystiedot() {
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
    public void testVirkailijalleEiTallennuVtjYhteystiedot() {
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
    public void testKielisyysTallentuu() {
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