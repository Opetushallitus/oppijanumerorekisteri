package fi.vm.sade.oppijanumerorekisteri.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import software.amazon.awssdk.services.sns.SnsClient;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.*;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.AssertPublished.assertPublished;
import static fi.vm.sade.oppijanumerorekisteri.services.Koodisto.MAAT_JA_VALTIOT_2;
import static java.util.Collections.singleton;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@IntegrationTest
public class OppijaServiceTest {

    @MockBean
    private UserDetailsHelper userDetailsHelper;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private PermissionChecker permissionChecker;

    @MockBean
    private KoodistoService koodistoService;

    @MockBean
    private OrganisaatioClient organisaatioClient;

    @Autowired
    private DatabaseService databaseService;

    @MockBean
    private SnsClient snsClient;

    @Autowired
    private OppijaService oppijaService;

    @Autowired
    private HenkiloRepository henkiloRepository;

    @Autowired
    private IdentificationRepository identificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Before
    public void setup() {
        when(userDetailsHelper.findCurrentUserOid()).thenReturn(Optional.of("user1"));
        when(permissionChecker.getOrganisaatioOids(any(), any())).thenReturn(singleton("1.2.3.4"));
    }

    @After
    public void cleanup() {
        databaseService.truncate();
    }

    private OppijaTuontiReadDto create(OppijaTuontiCreateDto createDto) {
        OppijaTuontiPerustiedotReadDto dto = oppijaService.create(createDto, TuontiApi.OPPIJA);
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
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

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
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithSameHetu() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);
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
                                .build(), OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste2")
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
                .containsExactlyInAnyOrder("tunniste1", "tunniste2");
        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        assertThat(henkilo).extracting(Henkilo::getHetu, Henkilo::getEtunimet, Henkilo::getSukunimi)
                .containsExactly("180897-945K", "etu", "suku");
        assertPublished(objectMapper, snsClient, 2, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithPassinumero() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

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

        create(createDto);

        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        Iterable<String> passinumerot = henkiloRepository.findPassinumerotByOid(henkilo.getOidHenkilo());
        assertThat(passinumerot).containsExactly("passi123");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithIdentification() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

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

        create(createDto);

        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        Iterable<Identification> identifications = identificationRepository.findByHenkiloOid(henkilo.getOidHenkilo());
        assertThat(identifications)
                .extracting(Identification::getIdentifier)
                .containsExactly("example@example.com");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithSukupuoli() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        when(koodistoService.list(Koodisto.SUKUPUOLI))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.SUKUPUOLI).koodi("1").build());
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .sukupuoli(new KoodiUpdateDto("1"))
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        create(createDto);

        List<Henkilo> henkilot = henkiloRepository.findAll();
        assertThat(henkilot).hasSize(1);
        Henkilo henkilo = henkilot.iterator().next();
        assertThat(henkilo.getSukupuoli()).isEqualTo("1");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithAidinkieli() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        when(koodistoService.list(eq(Koodisto.KIELI)))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("FI").koodi("SV").build());
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .aidinkieli(new KoodiUpdateDto("SV"))
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        create(createDto);

        databaseService.runInTransaction(() -> {
            List<Henkilo> henkilot = henkiloRepository.findAll();
            assertThat(henkilot).hasSize(1);
            Henkilo henkilo = henkilot.get(0);
            assertThat(henkilo.getAidinkieli().getKieliKoodi()).isEqualTo("sv");
            assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
        });
    }

    @Test
    public void getOrCreateShouldCreateNewHenkiloWithKansalaisuus() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        when(koodistoService.list(MAAT_JA_VALTIOT_2))
                .thenReturn(new KoodiTypeListBuilder(MAAT_JA_VALTIOT_2).koodi("123").koodi("456").build());
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .sahkoposti("example@example.com")
                                        .etunimet("etu")
                                        .kutsumanimi("etu")
                                        .sukunimi("suku")
                                        .kansalaisuus(Stream.of("123", "456").map(KoodiUpdateDto::new).collect(toSet()))
                                        .build())
                                .build())
                        .collect(toList()))
                .build();

        create(createDto);

        databaseService.runInTransaction(() -> {
            List<Henkilo> henkilot = henkiloRepository.findAll();
            assertThat(henkilot).hasSize(1);
            Henkilo henkilo = henkilot.get(0);
            List<String> kansalaisuus = henkilo.getKansalaisuus().stream()
                    .map(Kansalaisuus::getKansalaisuusKoodi)
                    .collect(toList());
            assertThat(kansalaisuus).containsExactlyInAnyOrder("123", "456");
            assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
        });
    }

    @Test
    public void getOrCreateShouldFindByOid() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid2")
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        reset(snsClient);

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
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldFindByHetu() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .hetu("180897-945K")
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        reset(snsClient);

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
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldFindByKaikkiHetut() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .hetu("180897-945K")
                .kaikkiHetut(Stream.of("180897-945K", "180897-787F").collect(toSet()))
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        reset(snsClient);

        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .hetu("180897-787F")
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
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldFindByPassinumero() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .passinumerot(Stream.of("passi123").collect(toSet()))
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        reset(snsClient);

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
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void getOrCreateShouldFindBySahkoposti() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .identifications(Stream.of(Identification.builder()
                                .idpEntityId(IdpEntityId.email)
                                .identifier("example@example.com")
                                .build())
                        .collect(toSet()))
                .etunimet("etu")
                .kutsumanimi("suku")
                .sukunimi("suku")
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);
        reset(snsClient);

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
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void shouldFindByNameAsAdmin() {
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));

        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("oid1")
                .passinumerot(Collections.singleton("passi123"))
                .identifications(Stream.of(Identification.builder()
                                .idpEntityId(IdpEntityId.email)
                                .identifier("example@example.com")
                                .build())
                        .collect(toSet()))
                .etunimet("Arpa Noppa")
                .kutsumanimi("Noppa")
                .sukunimi("Kuutio")
                .created(new Date())
                .modified(new Date())
                .build();
        henkiloRepository.save(henkilo);

        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .passinumero("passi123")
                                        .etunimet("Arpa Noppa")
                                        .kutsumanimi("Noppa")
                                        .sukunimi("Kuutio")
                                        .build())
                                .build())
                        .collect(toList()))
                .build();
        create(createDto);

        OppijaTuontiCriteria criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("arpa")
                .build();
        Page<OppijaListDto> result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("ar")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("noppa")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("nop")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("kuutio")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("kuu")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("arpa noppa kuutio")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("noppa kuutio")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).containsExactly("oid1");

        criteria = OppijaTuontiCriteria.builder()
                .nimiHaku("siansaksaa")
                .build();
        result = this.oppijaService
                .list(criteria, 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
        assertThat(result).extracting(OppijaListDto::getOid).isEmpty();

    }

    @Test
    public void passiivisetAliorganisaatiotTarkistetaan() {
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(false);
        given(this.permissionChecker.getAllOrganisaatioOids(any(), any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.userDetailsHelper.getCurrentUserOid()).willReturn("1.2.3.4.5");

        this.oppijaService.list(OppijaTuontiCriteria.builder().build(), 1, 100, OppijaTuontiSortKey.CREATED, Sort.Direction.ASC);
    }

    @Test(expected = UnprocessableEntityException.class)
    public void requiresHetuIfNationalityIsFinnish() {
        given(koodistoService.list(MAAT_JA_VALTIOT_2)).willReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2).koodi(Kansalaisuus.SUOMI).build());
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .etunimet("Arpa Noppa")
                                        .kutsumanimi("Noppa")
                                        .sukunimi("Kuutio")
                                        .kansalaisuus(List.of(new KoodiUpdateDto(Kansalaisuus.SUOMI)))
                                        .build())
                                .build())
                        .collect(toList()))
                .build();
        create(createDto);
    }

    @Test
    public void hetuPresentAndNationalityIsFinnish() {
        given(this.permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any())).willReturn(Set.of("1.2.3.4"));
        given(this.permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        given(koodistoService.list(MAAT_JA_VALTIOT_2)).willReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2).koodi(Kansalaisuus.SUOMI).build());
        OppijaTuontiCreateDto createDto = OppijaTuontiCreateDto.builder()
                .henkilot(Stream.of(OppijaTuontiRiviCreateDto.builder()
                                .tunniste("tunniste1")
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .etunimet("Arpa Noppa")
                                        .kutsumanimi("Noppa")
                                        .sukunimi("Kuutio")
                                        .hetu("whatever")
                                        .kansalaisuus(List.of(new KoodiUpdateDto(Kansalaisuus.SUOMI)))
                                        .build())
                                .build())
                        .collect(toList()))
                .build();
        assertThat(create(createDto).getKasiteltavia()).isEqualTo(1);
    }
}
