package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.OrganisaatioHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import static java.util.Collections.singletonList;
import java.util.Date;
import java.util.Optional;
import static java.util.stream.Collectors.toSet;
import java.util.stream.Stream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.assertj.core.api.Assertions.tuple;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@IntegrationTest
public class OppijaServiceTest {

    @MockBean
    private UserDetailsHelper userDetailsHelper;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @Autowired
    private OppijaService oppijaService;

    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private TuontiRepository tuontiRepository;

    @Before
    public void setup() {
        when(userDetailsHelper.findCurrentUserOid()).thenReturn(Optional.of("user1"));
        when(kayttooikeusClient.getOrganisaatioHenkilot(any(), anyBoolean())).thenReturn(
                singletonList(OrganisaatioHenkiloDto.builder().organisaatioOid("1.2.3.4").build())
        );
        tuontiRepository.deleteAll();
        henkiloRepository.deleteAll();
    }

    @Test
    public void getOrCreateShouldValidateOidIsUnique() {
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .oid("oid1")
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build(),
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .oid("oid1")
                                        .hetu("060997-915N")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        Throwable throwable = catchThrowable(() -> oppijaService.getOrCreate(createDto));

        assertThat(throwable).isInstanceOf(ValidationException.class)
                .hasMessage("Duplikaatti OID oid1");
    }

    @Test
    public void getOrCreateShouldValidateHetuIsUnique() {
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build(),
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        Throwable throwable = catchThrowable(() -> oppijaService.getOrCreate(createDto));

        assertThat(throwable).isInstanceOf(ValidationException.class)
                .hasMessage("Duplikaatti hetu 180897-945K");
    }

    @Test
    public void getOrCreateShouldValidatePassinumeroIsUnique() {
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .passinumero("passi123")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build(),
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .passinumero("passi123")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        Throwable throwable = catchThrowable(() -> oppijaService.getOrCreate(createDto));

        assertThat(throwable).isInstanceOf(ValidationException.class)
                .hasMessage("Duplikaatti passinumero passi123");
    }

    @Test
    public void getOrCreateShouldValidateSahkopostiIsUnique() {
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build(),
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        Throwable throwable = catchThrowable(() -> oppijaService.getOrCreate(createDto));

        assertThat(throwable).isInstanceOf(ValidationException.class)
                .hasMessage("Duplikaatti sähköposti example@example.com");
    }

    @Test
    public void getOrCreateShouldCreateNewHenkilo() {
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        OppijatReadDto readDto = oppijaService.getOrCreate(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(OppijaReadDto::getTunniste)
                .containsExactly("tunniste1");
        assertThat(henkiloRepository.findAll()).hasSize(1);
    }

    @Test
    public void getOrCreateShouldFindByOid() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid2")
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .henkiloTyyppi(HenkiloTyyppi.OPPIJA)
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .oid("oid2")
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        OppijatReadDto readDto = oppijaService.getOrCreate(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(t -> t.getTunniste(), t -> t.getHenkilo().getOid())
                .containsExactly(tuple("tunniste1", "oid2"));
        assertThat(henkiloRepository.findAll()).hasSize(1);
    }

    @Test
    public void getOrCreateShouldFindByHetu() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .hetu("180897-945K")
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .henkiloTyyppi(HenkiloTyyppi.OPPIJA)
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        OppijatReadDto readDto = oppijaService.getOrCreate(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(t -> t.getTunniste(), t -> t.getHenkilo().getOid())
                .containsExactly(tuple("tunniste1", "oid1"));
        assertThat(henkiloRepository.findAll()).hasSize(1);
    }

    @Test
    public void getOrCreateShouldFindByPassinumero() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .passinumerot(Stream.of("passi123").collect(toSet()))
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .henkiloTyyppi(HenkiloTyyppi.OPPIJA)
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .passinumero("passi123")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        OppijatReadDto readDto = oppijaService.getOrCreate(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(t -> t.getTunniste(), t -> t.getHenkilo().getOid())
                .containsExactly(tuple("tunniste1", "oid1"));
        assertThat(henkiloRepository.findAll()).hasSize(1);
    }

    @Test
    public void getOrCreateShouldFindBySahkoposti() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .identifications(Stream.of(Identification.builder()
                        .idpEntityId("email")
                        .identifier("example@example.com")
                        .build())
                        .collect(toSet()))
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .henkiloTyyppi(HenkiloTyyppi.OPPIJA)
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        OppijatCreateDto createDto = OppijatCreateDto.builder()
                .henkilot(Stream.of(
                        OppijaCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaCreateDto.HenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toSet()))
                .build();

        OppijatReadDto readDto = oppijaService.getOrCreate(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(t -> t.getTunniste(), t -> t.getHenkilo().getOid())
                .containsExactly(tuple("tunniste1", "oid1"));
        assertThat(henkiloRepository.findAll()).hasSize(1);
    }

}
