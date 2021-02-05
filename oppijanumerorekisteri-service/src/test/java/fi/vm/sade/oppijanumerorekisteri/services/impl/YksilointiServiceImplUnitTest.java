package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.Assert.*;
import static org.mockito.Mockito.doReturn;

@RunWith(SpringRunner.class)
public class YksilointiServiceImplUnitTest {

    @InjectMocks
    private YksilointiServiceImpl yksilointiService;

    @Mock
    private DuplicateService duplicateService;
    @Mock
    private KoodistoService koodistoService;
    @Mock
    private HenkiloRepository henkiloRepository;
    @Mock
    private HenkiloModificationService henkiloModificationService;
    @Mock
    private KansalaisuusRepository kansalaisuusRepository;
    @Mock
    private KielisyysRepository kielisyysRepository;
    @Mock
    private YhteystiedotRyhmaRepository yhteystiedotRyhmaRepository;
    @Mock
    private YhteystietoRepository yhteystietoRepository;
    @Mock
    private YksilointitietoRepository yksilointitietoRepository;
    @Mock
    private YksilointivirheRepository yksilointivirheRepository;
    @Mock
    private AsiayhteysPalveluRepository asiayhteysPalveluRepository;
    @Mock
    private AsiayhteysHakemusRepository asiayhteysHakemusRepository;
    @Mock
    private AsiayhteysKayttooikeusRepository asiayhteysKayttooikeusRepository;
    @Mock
    private OrikaConfiguration mapper;
    @Mock
    private VtjClient vtjClient;
    @Mock
    private KayttooikeusClient kayttooikeusClient;
    @Mock
    private OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    @Before
    public void setUp() {
        doReturn(0.85f).when(oppijanumerorekisteriProperties).getEtunimiThreshold();
        doReturn(0.85f).when(oppijanumerorekisteriProperties).getSukunimiThreshold();
    }

    @Test
    public void tarkistaNimetOK() {
        String[][] fixtures = new String[][]{
                new String[]{"Testi", "Testi", "Testi", "Testi"},
                new String[]{"Sukunimi", "Kutsumanimi", "Kutsumanimi", "Sukunimi"},         // onrSukunimi === vtjSukunimi && onrKutsumanimi === vtjEtunimi
                new String[]{"Sukunimi", "Kutsumanimi", "Kutsumanimi", "CCCC", "Sukunimi"}, // onrSukunimi === vtjSukunimi[1] && onrKutsumanimi === vtjEtunimi
                new String[]{"Sukunimi", "Anna", "Hanna-Leena", "Sukunimi"},                // Suspicious Hanna-Leena.contains(Anna)
                // ||
                new String[]{"Kutsumanimi", "Sukunimi", "Kutsumanimi", "Sukunimi"},         // onrKutsumanimi === vtjSukunimi && onrSukunimi === vtjEtunimi
                new String[]{"Kutsumanimi", "Sukunimi", "Kutsumanimi", "CCCC", "Sukunimi"}, // onrKutsumanimi === vtjSukunimi[1] && onrSukunimi === vtjEtunimi
                new String[]{"Anna", "Sukunimi", "Hanna-Leena", "Sukunimi"},                // Suspicious Hanna-Leena.contains(Anna)
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            assertTrue(tarkistaNimet(fixture[0], fixture[1], fixture[2], Arrays.copyOfRange(fixture, 3, fixture.length)));
        });
    }

    @Test
    public void tarkistaNimetNOK() {
        String[][] fixtures = new String[][]{
                new String[]{"onrSukunimi", "onrKutsumanimi", "vtjEtunimi", "vtjSukunimi"}
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            assertFalse(tarkistaNimet(fixture[0], fixture[1], fixture[2], Arrays.copyOfRange(fixture, 3, fixture.length)));
        });
    }

    private boolean tarkistaNimet(String onrSukunimi, String onrKutsumanimi, String vtjEtunimi, String ...vtjSukunimet) {
        Henkilo onrHenkilo = new Henkilo();
        onrHenkilo.setSukunimi(onrSukunimi);
        onrHenkilo.setKutsumanimi(onrKutsumanimi);

        YksiloityHenkilo vtjHenkilo = new YksiloityHenkilo();
        vtjHenkilo.setEtunimi(vtjEtunimi);

        Set<String> kaikkiSukunimet = Stream.of(vtjSukunimet).collect(Collectors.toSet());

        return yksilointiService.tarkistaNimet(onrHenkilo, vtjHenkilo, kaikkiSukunimet);
    }

    @Test
    public void normalize() {
        String[][] fixtures = new String[][]{
                new String[]{"", ""},       // Handles empty strings
                new String[]{" ", " "},     // and whitespaces
                new String[]{"a", "a"},     // Does not alter already normalized string
                new String[]{"A", "a"},     // Converts strings to lower case
                new String[]{"ä", "a"},     // Umlauts are converted
                new String[]{"á", "a"},     // As are other accents also
                new String[]{"=-_.:!#/()", "=-_.:!#/()"},     // Special characters not altered
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            String input = fixture[0];
            String result = yksilointiService.normalize(input);
            String expected = fixture[1];
            assertEquals("Unexpected result after normalization", expected, result);
        });
    }

    @Test
    public void tarkistaSukunimiOK() {
        String[][] fixtures = new String[][]{
                new String[]{" ", " "},
                new String[]{"test", "test"},
                new String[]{"test", "tes"},
                new String[]{"test", "te"},
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            assertTrue(yksilointiService.tarkistaSukunimi(fixture[0], fixture[1]));
        });
    }

    @Test
    public void tarkistaSukunimiNOK() {
        String[][] fixtures = new String[][]{
                new String[]{"", ""},
                new String[]{"test", "t"},
                new String[]{"a", "b"},
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            assertFalse(yksilointiService.tarkistaSukunimi(fixture[0], fixture[1]));
        });
    }

    @Test
    public void tarkistaEtunimiOK() {
        String[][] fixtures = new String[][]{
                new String[]{"a", "a"},
                new String[]{"c", "a b c d"},
                new String[]{"anna", "hanna"},             // ? (JaroWinkler)
                new String[]{"virhe", "luultavastivirhe"}, // ? (contains)
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            assertTrue("Etunimi should match " + fixture[0], yksilointiService.tarkistaEtunimi(fixture[0], fixture[1]));
        });
    }

    @Test
    public void tarkistaEtunimiNOK() {
        String[][] fixtures = new String[][]{
                new String[]{"a", "b"},
                new String[]{"a", "b c d e f"},
        };
        Arrays.asList(fixtures).forEach(fixture -> {
            assertFalse("Etunimi should NOT match " + fixture[0], yksilointiService.tarkistaEtunimi(fixture[0], fixture[1]));
        });
    }
}
