package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ConflictException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class YksilointiServiceImplExistenceCheckTest {

    // This is hard-coded value from OppijanumerorekisteriProperties tweak appropriately
    private static final float THRESHOLD = 0.85f;

    private static YksilointiServiceImpl yksilointiService;
    private static VtjClient vtjClient;
    private static HenkiloRepository henkiloRepository;

    @BeforeAll
    static void setup() {
        vtjClient = mock(VtjClient.class);
        henkiloRepository = mock(HenkiloRepository.class);
        OppijanumerorekisteriProperties oppijanumerorekisteriProperties = mock(OppijanumerorekisteriProperties.class);
        when(oppijanumerorekisteriProperties.getEtunimiThreshold()).thenReturn(THRESHOLD);
        yksilointiService = new YksilointiServiceImpl(
                null,
                null,
                henkiloRepository,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                vtjClient,
                null,
                oppijanumerorekisteriProperties);
    }

    private static Stream<Arguments> matchingOnrData() {
        return Stream.of(
                Arguments.of("Identical details",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d")),
                Arguments.of("Is case insensitive",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "A B C", "B", "D")),
                Arguments.of("Handles umlauts",
                        new HenkiloExistenceCheckDto("", "a b c", "äyrämö", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "äyrämö", "d")),
                Arguments.of("Handles accents",
                        new HenkiloExistenceCheckDto("", "a b c", "Amélie", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "Amélie", "d")),
                Arguments.of("Fuzzy match on firstname (string distance " + THRESHOLD + ")",
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karhu"),
                        new HenkiloExistenceCheckDto("", "Eelis Tapani", "Hurja", "Karhu")),
                Arguments.of("Fuzzy match on nickname (string distance " + THRESHOLD + ")",
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karhu"),
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Kurja", "Karhu")),
                Arguments.of("Fuzzy match on lastname (string distance " + THRESHOLD + ")",
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karhu"),
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karju")),
                Arguments.of("Handles special characters",
                        new HenkiloExistenceCheckDto("", "Renée Nöel Zoë", "Zoë", "Søren"),
                        new HenkiloExistenceCheckDto("", "Renee Noel Zoe", "Zoe", "Soren")),
                Arguments.of("Handles hyphens",
                        new HenkiloExistenceCheckDto("", "Eva-Kaarina", "Nyrkki-Kyllikki", "Halla-aho"),
                        new HenkiloExistenceCheckDto("", "eva kaarina", "nyrkkikyllikki", "hallaaho"))
        );
    }

    private static Stream<Arguments> conflictingOnrData() {
        return Stream.of(
                Arguments.of("Handles null:s (artificial test case)",
                        new HenkiloExistenceCheckDto("", null, null, null),
                        new HenkiloExistenceCheckDto("", null, null, null)),
                Arguments.of("Conflicting details",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "x y z", "i", "l")),
                Arguments.of("Kutsumanimi empty in ONR data",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "", "d")),
                Arguments.of("Kutsumanimi blank in ONR data",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", " ", "d")),
                Arguments.of("Kutsumanimi null in ONR data (should not happen in reality)",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", null, "d"))
        );
    }

    private static Stream<Arguments> conflictingVtjData() {
        return Stream.of(
                Arguments.of("Handles null:s (artificial test case)",
                        new HenkiloExistenceCheckDto("", null, null, null),
                        new HenkiloExistenceCheckDto("", null, null, null)),
                Arguments.of("Conflicting details",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "x y z", "i", "l"))
        );
    }

    private static Stream<Arguments> matchingVtjData() {
        return Stream.of(
                Arguments.of("Identical details",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d")),
                Arguments.of("Kutsumanimi empty in VTJ data",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "", "d")),
                Arguments.of("Kutsumanimi blank in VTJ data",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", " ", "d")),
                Arguments.of("Kutsumanimi null in VTJ data (should not happen in reality)",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", null, "d")),
                Arguments.of("Is case insensitive",
                        new HenkiloExistenceCheckDto("", "a b c", "b", "d"),
                        new HenkiloExistenceCheckDto("", "A B C", "B", "D")),
                Arguments.of("Handles umlauts",
                        new HenkiloExistenceCheckDto("", "a b c", "äyrämö", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "äyrämö", "d")),
                Arguments.of("Handles accents",
                        new HenkiloExistenceCheckDto("", "a b c", "Amélie", "d"),
                        new HenkiloExistenceCheckDto("", "a b c", "Amélie", "d")),
                Arguments.of("Fuzzy match on firstname (string distance " + THRESHOLD + ")",
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karhu"),
                        new HenkiloExistenceCheckDto("", "Eelis Tapani", "Hurja", "Karhu")),
                Arguments.of("Fuzzy match on nickname (string distance " + THRESHOLD + ")",
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karhu"),
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Kurja", "Karhu")),
                Arguments.of("Fuzzy match on lastname (string distance " + THRESHOLD + ")",
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karhu"),
                        new HenkiloExistenceCheckDto("", "Elias Tapani", "Hurja", "Karju")),
                Arguments.of("Handles special characters",
                        new HenkiloExistenceCheckDto("", "Renée Nöel Zoë", "Zoë", "Søren"),
                        new HenkiloExistenceCheckDto("", "Renee Noel Zoe", "Zoe", "Soren")),
                Arguments.of("Handles hyphens",
                        new HenkiloExistenceCheckDto("", "Eva-Kaarina", "Nyrkki-Kyllikki", "Halla-aho"),
                        new HenkiloExistenceCheckDto("", "eva kaarina", "nyrkkikyllikki", "hallaaho"))
        );
    }

    @BeforeEach
    void resetMocks() {
        reset(henkiloRepository);
        reset(vtjClient);
    }

    @DisplayName("ONR details match")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("matchingOnrData")
    void testOnrOk(String msg, HenkiloExistenceCheckDto input, HenkiloExistenceCheckDto onrData) {
        Henkilo henkilo = mock(Henkilo.class);
        when(henkilo.getOidHenkilo()).thenReturn("oid");
        when(henkilo.getEtunimet()).thenReturn(onrData.getEtunimet());
        when(henkilo.getKutsumanimi()).thenReturn(onrData.getKutsumanimi());
        when(henkilo.getSukunimi()).thenReturn(onrData.getSukunimi());

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.of(henkilo));

        assertThat(yksilointiService.exists(input)).isEqualTo(Optional.of("oid"));

        verify(vtjClient, never()).fetchHenkilo(any());
    }

    @DisplayName("ONR details conflict")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("conflictingOnrData")
    void testOnrNok(String msg, HenkiloExistenceCheckDto input, HenkiloExistenceCheckDto onrData) {
        Henkilo henkilo = mock(Henkilo.class);
        when(henkilo.getOidHenkilo()).thenReturn("oid");
        when(henkilo.getEtunimet()).thenReturn(onrData.getEtunimet());
        when(henkilo.getKutsumanimi()).thenReturn(onrData.getKutsumanimi());
        when(henkilo.getSukunimi()).thenReturn(onrData.getSukunimi());

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.of(henkilo));

        assertThrows(ConflictException.class, () -> yksilointiService.exists(input));

        verify(vtjClient, never()).fetchHenkilo(any());
    }

    @DisplayName("VTJ details match")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("matchingVtjData")
    void testVtjOk(String msg, HenkiloExistenceCheckDto input, HenkiloExistenceCheckDto vtjData) {
        YksiloityHenkilo henkilo = mock(YksiloityHenkilo.class);
        when(henkilo.getEtunimi()).thenReturn(vtjData.getEtunimet());
        when(henkilo.getKutsumanimi()).thenReturn(vtjData.getKutsumanimi());
        when(henkilo.getSukunimi()).thenReturn(vtjData.getSukunimi());

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjClient.fetchHenkilo(any())).thenReturn(Optional.of(henkilo));

        assertThat(yksilointiService.exists(input)).isEmpty();

        verify(henkiloRepository, times(1)).findByHetu(any());
    }

    @DisplayName("VTJ details conflict")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("conflictingVtjData")
    void testVtjNok(String msg, HenkiloExistenceCheckDto input, HenkiloExistenceCheckDto vtjData) {
        YksiloityHenkilo henkilo = mock(YksiloityHenkilo.class);
        when(henkilo.getEtunimi()).thenReturn(vtjData.getEtunimet());
        when(henkilo.getKutsumanimi()).thenReturn(vtjData.getKutsumanimi());
        when(henkilo.getSukunimi()).thenReturn(vtjData.getSukunimi());

        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());
        when(vtjClient.fetchHenkilo(any())).thenReturn(Optional.of(henkilo));

        assertThrows(ConflictException.class, () -> yksilointiService.exists(input));

        verify(henkiloRepository, times(1)).findByHetu(any());
    }
}