package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import static java.util.Collections.singleton;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import java.util.stream.Stream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.ArgumentMatchers.any;
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
    private IdentificationRepository identificationRepository;
    @Autowired
    private TuontiRepository tuontiRepository;

    @Before
    public void setup() {
        when(userDetailsHelper.findCurrentUserOid()).thenReturn(Optional.of("user1"));
        when(kayttooikeusClient.getAktiivisetOrganisaatioHenkilot(any())).thenReturn(singleton("1.2.3.4"));
    }

    @After
    public void cleanup() {
        tuontiRepository.deleteAll();
        henkiloRepository.deleteAll();
    }

    private OppijaTuontiReadDto create(OppijaTuontiCreateDto createDto) {
        OppijaTuontiPerustiedotReadDto dto = oppijaService.create(createDto);
        int i = 0;
        while (i < 10) {
            ++i;
            dto = oppijaService.getTuontiById(dto.getId());
            if (dto.isKasitelty()) {
                break;
            }
            try {
                Thread.sleep(1000L);
            } catch (InterruptedException ex) {
                throw new RuntimeException(ex);
            }
        }
        if (!dto.isKasitelty()) {
            throw new RuntimeException("Oppijoiden tuonnin käsittely epäonnistui");
        }
        return oppijaService.getOppijatByTuontiId(dto.getId());
    }

    @Test
    public void getOrCreateShouldCreateNewHenkilo() {
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .oid("oid1")
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(OppijaTuontiRiviReadDto::getTunniste)
                .containsExactly("tunniste1");
        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        assertThat(henkilo).extracting(Henkilo::getHetu, Henkilo::getEtunimet, Henkilo::getSukunimi)
                .containsExactly("180897-945K", "etu", "suku");
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithPassinumero() {
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .passinumero("passi123")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        Iterable<String> passinumerot = henkiloRepository.findPassinumerotByOid(henkilo.getOidHenkilo());
        assertThat(passinumerot).containsExactly("passi123");
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithIdentification() {
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        Iterable<Identification> identifications = identificationRepository.findByHenkiloOid(henkilo.getOidHenkilo());
        assertThat(identifications)
                .extracting(Identification::getIdentifier)
                .containsExactly("example@example.com");
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
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .oid("oid2")
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(OppijaTuontiRiviReadDto::getTunniste, t -> t.getHenkilo().getOid())
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
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .hetu("180897-945K")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(OppijaTuontiRiviReadDto::getTunniste, t -> t.getHenkilo().getOid())
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
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .passinumero("passi123")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(OppijaTuontiRiviReadDto::getTunniste, t -> t.getHenkilo().getOid())
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
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        OppijaTuontiReadDto readDto = create(createDto);

        assertThat(readDto.getId()).isNotNull();
        assertThat(readDto.getHenkilot())
                .extracting(OppijaTuontiRiviReadDto::getTunniste, t -> t.getHenkilo().getOid())
                .containsExactly(tuple("tunniste1", "oid1"));
        assertThat(henkiloRepository.findAll()).hasSize(1);
    }

}
