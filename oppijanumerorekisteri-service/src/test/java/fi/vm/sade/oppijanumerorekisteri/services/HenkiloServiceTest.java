package fi.vm.sade.oppijanumerorekisteri.services;


import com.google.common.collect.Sets;
import com.querydsl.core.types.Predicate;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi.*;
import java.time.LocalDate;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptySet;

import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = OrikaConfiguration.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class HenkiloServiceTest {
    @Autowired
    private OrikaConfiguration mapper;

    private HenkiloJpaRepository henkiloJpaRepositoryMock;
    private HenkiloViiteRepository henkiloViiteRepositoryMock;
    private HenkiloRepository henkiloDataRepositoryMock;
    private HenkiloService service;
    private UserDetailsHelper userDetailsHelperMock;
    private PermissionChecker permissionCheckerMock;
    private KielisyysRepository kielisyysRepositoryMock;
    private KansalaisuusRepository kansalaisuusRepositoryMock;
    private OppijanumerorekisteriProperties oppijanumerorekisteriProperties;
    private KayttooikeusClient kayttooikeusClient;

    @Before
    public void setup() {
        this.henkiloJpaRepositoryMock = Mockito.mock(HenkiloJpaRepository.class);
        this.henkiloDataRepositoryMock = Mockito.mock(HenkiloRepository.class);
        MockOidGenerator mockOidGenerator = new MockOidGenerator();
        this.userDetailsHelperMock = Mockito.mock(UserDetailsHelper.class);
        this.kielisyysRepositoryMock = Mockito.mock(KielisyysRepository.class);
        this.kansalaisuusRepositoryMock = Mockito.mock(KansalaisuusRepository.class);
        this.permissionCheckerMock = Mockito.mock(PermissionChecker.class);
        HenkiloUpdatePostValidator henkiloUpdatePostValidatorMock = Mockito.mock(HenkiloUpdatePostValidator.class);
        HenkiloCreatePostValidator henkiloCreatePostValidatorMock = Mockito.mock(HenkiloCreatePostValidator.class);
        this.henkiloViiteRepositoryMock = Mockito.mock(HenkiloViiteRepository.class);
        this.oppijanumerorekisteriProperties = Mockito.mock(OppijanumerorekisteriProperties.class);
        kayttooikeusClient = Mockito.mock(KayttooikeusClient.class);

        this.service = spy(new HenkiloServiceImpl(this.henkiloJpaRepositoryMock, henkiloDataRepositoryMock, henkiloViiteRepositoryMock,
                mapper, new YhteystietoConverter(), mockOidGenerator, this.userDetailsHelperMock, this.kielisyysRepositoryMock,
                this.kansalaisuusRepositoryMock, this.permissionCheckerMock,
                henkiloUpdatePostValidatorMock, henkiloCreatePostValidatorMock, oppijanumerorekisteriProperties, kayttooikeusClient));
    }

    @Test
    public void listShouldReturnEmptySliceWhenEmptySallitutHenkiloOids() {
        HenkiloHakuCriteria criteria = new HenkiloHakuCriteria();
        when(kayttooikeusClient.getHenkiloKayttooikeudet(any(), any())).thenReturn(KayttooikeudetDto.user(emptySet()));

        Slice<HenkiloHakuDto> slice = service.list(criteria, 1, 20);

        assertThat(slice.getResults()).isEmpty();
        verifyZeroInteractions(henkiloJpaRepositoryMock);
    }

    @Test
    public void listShouldCreateSliceCorrectly() {
        HenkiloHakuCriteria criteria = new HenkiloHakuCriteria();
        when(kayttooikeusClient.getHenkiloKayttooikeudet(any(), any()))
                .thenReturn(KayttooikeudetDto.user(Stream.of("henkilo1", "henkilo2", "henkilo3").collect(toSet())));
        HenkiloHakuDto henkilo1 = HenkiloHakuDto.builder().oidHenkilo("1").build();
        HenkiloHakuDto henkilo2 = HenkiloHakuDto.builder().oidHenkilo("2").build();
        HenkiloHakuDto henkilo3 = HenkiloHakuDto.builder().oidHenkilo("3").build();
        when(henkiloJpaRepositoryMock.findBy(any(), anyLong(), anyLong()))
                .thenReturn(asList(henkilo1, henkilo2, henkilo3));

        Slice<HenkiloHakuDto> slice;

        slice = service.list(criteria, 1, 3);
        assertThat(slice.getResults()).containsExactly(henkilo1, henkilo2, henkilo3);
        assertThat(slice.isLast()).isTrue();

        slice = service.list(criteria, 1, 2);
        assertThat(slice.getResults()).containsExactly(henkilo1, henkilo2);
        assertThat(slice.isLast()).isFalse();

        slice = service.list(criteria, 2, 3);
        assertThat(slice.getResults()).containsExactly(henkilo1, henkilo2, henkilo3);
        assertThat(slice.isLast()).isTrue();

        slice = service.list(criteria, 2, 1);
        assertThat(slice.getResults()).containsExactly(henkilo1);
        assertThat(slice.isLast()).isFalse();
    }

    @Test
    public void listShouldSearchByHenkiloOids() {
        HenkiloHakuCriteria criteria = new HenkiloHakuCriteria();
        when(kayttooikeusClient.getHenkiloKayttooikeudet(any(), any()))
                .thenReturn(KayttooikeudetDto.user(Stream.of("henkilo1", "henkilo2", "henkilo3").collect(toSet())));

        Slice<HenkiloHakuDto> slice = service.list(criteria, 1, 20);

        ArgumentCaptor<HenkiloCriteria> criteriaCaptor = ArgumentCaptor.forClass(HenkiloCriteria.class);
        verify(henkiloJpaRepositoryMock).findBy(criteriaCaptor.capture(), eq(21L), eq(0L));
        HenkiloCriteria henkiloCriteria = criteriaCaptor.getValue();
        assertThat(henkiloCriteria.getHenkiloOids()).containsExactlyInAnyOrder("henkilo1", "henkilo2", "henkilo3");
    }

    @Test
    public void listShouldFilterHenkiloOids() {
        HenkiloHakuCriteria criteria = new HenkiloHakuCriteria();
        criteria.setHenkiloOids(Stream.of("henkilo1", "henkilo3", "henkilo5").collect(toSet()));
        when(kayttooikeusClient.getHenkiloKayttooikeudet(any(), any()))
                .thenReturn(KayttooikeudetDto.user(Stream.of("henkilo1", "henkilo2", "henkilo3").collect(toSet())));

        Slice<HenkiloHakuDto> slice = service.list(criteria, 1, 20);

        ArgumentCaptor<HenkiloCriteria> criteriaCaptor = ArgumentCaptor.forClass(HenkiloCriteria.class);
        verify(henkiloJpaRepositoryMock).findBy(criteriaCaptor.capture(), eq(21L), eq(0L));
        HenkiloCriteria henkiloCriteria = criteriaCaptor.getValue();
        assertThat(henkiloCriteria.getHenkiloOids()).containsExactlyInAnyOrder("henkilo1", "henkilo3");
    }

    @Test
    public void getHasHetu() {
        given(this.userDetailsHelperMock.getCurrentUserOid()).willReturn("1.2.3.4.5");
        given(this.henkiloJpaRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getHasHetu()).isTrue();
    }

    @Test
    public void getHasHetuNotFound() {
        given(this.userDetailsHelperMock.getCurrentUserOid()).willReturn("1.2.3.4.5");
        given(this.henkiloJpaRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.empty());
        assertThat(this.service.getHasHetu()).isFalse();
    }

    @Test
    public void getOidExists() {
        given(this.henkiloDataRepositoryMock.exists(any(Predicate.class))).willReturn(true);
        assertThat(this.service.getOidExists("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidByHetu() {
        given(this.henkiloJpaRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getOidByHetu("1.2.3.4.5")).isEqualTo("123456-9999");
    }

    @Test
    public void getHetusAndOids() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(0L), "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloHetuAndOidDto henkiloHetuAndOidDto = DtoUtils.createHenkiloHetuAndOidDto("1.2.3.4.5", "123456-9999",
                new Date(0L));

        given(this.henkiloJpaRepositoryMock.findHetusAndOids(null, 0, 100))
                .willReturn(Collections.singletonList(henkiloMock));

        assertThat(this.service.getHetusAndOids(null, 0, 100).get(0))
                .isEqualToComparingFieldByFieldRecursively(henkiloHetuAndOidDto);
    }

    @Test(expected = NotFoundException.class)
    public void getOidByHetuNotFound() {
        given(this.henkiloJpaRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.empty());
        this.service.getOidByHetu("1.2.3.4.5");
    }

    @Test
    public void getHenkiloYhteystiedot() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        HenkilonYhteystiedotViewDto results = this.service.getHenkiloYhteystiedot("1.2.3.4.5");
        assertThat(results).isNotNull();
        assertThat(results.asMap()).isNotNull();
        assertThat(results.asMap().size()).isEqualTo(2);
        
        YhteystiedotDto tyo = results.get("yhteystietotyyppi2");
        assertThat(tyo).isNotNull();
        assertThat(tyo.getKatuosoite()).isEqualTo("Työkatu 3");
        assertThat(tyo.getSahkoposti()).isEqualTo("testaaja@oph.fi");
        assertThat(tyo.getPuhelinnumero()).isEqualTo("04512345678");
        
        YhteystiedotDto koti = results.get("yhteystietotyyppi1");
        assertThat(koti).isNotNull();
        assertThat(koti.getKatuosoite()).isEqualTo("Siilikuja 6");
        assertThat(koti.getSahkoposti()).isEqualTo("testaaja@pp.inet.fi");
        assertThat(koti.getPuhelinnumero()).isNull();
    }

    private List<YhteystietoHakuDto> testYhteystiedot(String henkiloOid) {
        return asList(
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus("yhteystietotyyppi1")
                    .yhteystietoTyyppi(YHTEYSTIETO_KATUOSOITE)
                    .arvo("Siilikuja 6")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus("yhteystietotyyppi1")
                    .yhteystietoTyyppi(YHTEYSTIETO_SAHKOPOSTI)
                    .arvo("testaaja@pp.inet.fi")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus("yhteystietotyyppi2")
                    .yhteystietoTyyppi(YHTEYSTIETO_KATUOSOITE)
                    .arvo("Työkatu 3")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus("yhteystietotyyppi2")
                    .yhteystietoTyyppi(YHTEYSTIETO_SAHKOPOSTI)
                    .arvo("testaaja@oph.fi")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus("yhteystietotyyppi2")
                    .yhteystietoTyyppi(YHTEYSTIETO_PUHELINNUMERO)
                    .arvo("04512345678")
                .build()
        );
    }

    @Test
    public void getHenkiloYhteystiedotByRyhmaEmpty() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(emptyList());
        assertThat(this.service.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi1")).isEmpty();
    }

    @Test
    public void getHenkiloYhteystiedotByRyhma() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        Optional<YhteystiedotDto> tiedot = this.service.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi1");
        assertThat(tiedot.map(YhteystiedotDto::getKatuosoite)).hasValue("Siilikuja 6");
    }

    @Test
    public void generateOid() {
        String oid = ReflectionTestUtils.invokeMethod(service, "getFreePersonOid");
        assertThat(oid).isNotNull();
    }

    @Test
    public void getHenkiloPerustietoByOidsTest() {
        Date modified = new Date();
        HenkiloPerustietoDto henkiloMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), emptyList(), null, modified);
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), emptyList(), null, modified);
        given(this.henkiloJpaRepositoryMock.findByOidIn(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloMock));

        List<HenkiloPerustietoDto> henkiloPerustietoDtoList = this.service.getHenkiloPerustietoByOids(Collections.singletonList("1.2.3.4.5"));
        assertThat(henkiloPerustietoDtoList.size()).isEqualTo(1);
        HenkiloPerustietoDto henkiloPerustietoDto = henkiloPerustietoDtoList.get(0);
        assertThat(henkiloPerustietoDto).isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
    }

    @Test
    public void getHenkiloOidHetuNimiByName() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.VIRKAILIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        List<Henkilo> henkiloMockList = Collections.singletonList(henkiloMock);
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDtoMock = DtoUtils.createHenkiloOidHetuNimiDto("arpa noppa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5");
        List<String> etunimetList = Stream.of("arpa", "noppa").collect(Collectors.toList());
        given(this.henkiloJpaRepositoryMock.findHenkiloOidHetuNimisByEtunimetOrSukunimi(etunimetList, "kuutio"))
                .willReturn(henkiloMockList);

        List<HenkiloOidHetuNimiDto> henkiloOidHetuNimiDtoList = this.service.getHenkiloOidHetuNimiByName("arpa noppa", "kuutio");
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = henkiloOidHetuNimiDtoList.get(0);
        assertThat(henkiloOidHetuNimiDto).isEqualToComparingFieldByFieldRecursively(henkiloOidHetuNimiDtoMock);
    }

    @Test(expected = NotFoundException.class)
    public void getHenkiloOidHetuNimiByHetuNotFound() {
        given(this.henkiloJpaRepositoryMock.findOidHetuNimiByHetu("123456-9999")).willReturn(Optional.empty());
        this.service.getHenkiloOidHetuNimiByHetu("123456-9999");
    }

    @Test
    public void listPossibleHenkiloTypesAccessibleSuperUser() {
        given(this.permissionCheckerMock.isSuperUser()).willReturn(true);
        List<String> henkiloTyypit = this.service.listPossibleHenkiloTypesAccessible()
                .stream().sorted(String::compareToIgnoreCase).collect(Collectors.toList());
        assertThat(henkiloTyypit.size()).isEqualTo(3);
        assertThat(henkiloTyypit.get(0)).isEqualTo("OPPIJA");
        assertThat(henkiloTyypit.get(1)).isEqualTo("PALVELU");
        assertThat(henkiloTyypit.get(2)).isEqualTo("VIRKAILIJA");
    }

    @Test
    public void listPossibleHenkiloTypesAccessibleNormalUser() {
        given(this.permissionCheckerMock.isSuperUser()).willReturn(false);
        List<String> henkiloTyypit = this.service.listPossibleHenkiloTypesAccessible();
        assertThat(henkiloTyypit.size()).isEqualTo(1);
        assertThat(henkiloTyypit.get(0)).isEqualTo("VIRKAILIJA");
    }

    @Test
    public void updateHenkiloFromHenkiloUpdateDto() throws Exception {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA, "fi", "suomi", "246",
                new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        long yhteystiedotRyhmaId = henkilo.getYhteystiedotRyhma().stream().mapToLong(YhteystiedotRyhma::getId).max().orElse(0L) + 1;
        henkilo.getYhteystiedotRyhma().add(YhteystiedotRyhma.builder()
                .ryhmaKuvaus("yhteystietotyyppi5").ryhmaAlkuperaTieto("alkupera1")
                .id(yhteystiedotRyhmaId).readOnly(true)
                .build());
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246",
                "arpa@kuutio.fi");
        henkiloUpdateDto.getYhteystiedotRyhma().add(YhteystiedotRyhmaDto.builder()
                .id(yhteystiedotRyhmaId).readOnly(false)
                .ryhmaKuvaus("readonly").ryhmaAlkuperaTieto("readonly")
                .build());
        ArgumentCaptor<Henkilo> argument = ArgumentCaptor.forClass(Henkilo.class);
        given(this.henkiloDataRepositoryMock.findByOidHenkiloIsIn(Collections.singletonList(henkiloUpdateDto.getOidHenkilo())))
        .willReturn(Collections.singletonList(henkilo));
        given(userDetailsHelperMock.getCurrentUserOid()).willReturn("1.2.3.4.1");
        given(this.kielisyysRepositoryMock.findByKieliKoodi(anyString()))
                .willReturn(Optional.of(EntityUtils.createKielisyys("fi", "suomi")));
        given(this.kansalaisuusRepositoryMock.findOrCreate(anyString()))
                .willReturn(EntityUtils.createKansalaisuus("246"));

        this.service.updateHenkiloFromHenkiloUpdateDto(henkiloUpdateDto);
        verify(this.henkiloDataRepositoryMock).save(argument.capture());

        assertThat(argument.getValue().getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(argument.getValue().getAidinkieli().getKieliTyyppi()).isEqualTo("suomi");
        assertThat(argument.getValue().getAsiointiKieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(argument.getValue().getAsiointiKieli().getKieliTyyppi()).isEqualTo("suomi");

        assertThat(argument.getValue().getKielisyys().size()).isEqualTo(1);
        assertThat(argument.getValue().getKielisyys().iterator().next().getKieliKoodi()).isEqualTo("fi");
        assertThat(argument.getValue().getKielisyys().iterator().next().getKieliTyyppi()).isEqualTo("suomi");

        assertThat(argument.getValue().getKansalaisuus().size()).isEqualTo(1);
        assertThat(argument.getValue().getKansalaisuus().iterator().next().getKansalaisuusKoodi()).isEqualTo("246");

        assertThat(argument.getValue().getYhteystiedotRyhma())
                .extracting("id", "ryhmaAlkuperaTieto", "ryhmaKuvaus")
                .containsExactlyInAnyOrder(
                        tuple(1L, "alkupera2", "yhteystietotyyppi7"),
                        tuple(yhteystiedotRyhmaId, "alkupera1", "yhteystietotyyppi5"));

        assertThat(argument.getValue().getYhteystiedotRyhma())
                .flatExtracting("yhteystieto").extracting("yhteystietoTyyppi", "yhteystietoArvo")
                .containsExactly(tuple(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, "arpa@kuutio.fi"));
    }

    @Test
    public void findHenkiloViitteesTest() {
        given(this.oppijanumerorekisteriProperties.getHenkiloViiteSplitSize()).willReturn(5000);
        given(this.henkiloViiteRepositoryMock.findBy(any())).willReturn(singletonList(
                new HenkiloViiteDto("OID", "MASTER")));
        List<HenkiloViiteDto> results = this.service.findHenkiloViittees(new HenkiloCriteria());
        assertThat(results.size()).isEqualTo(1);
        assertThat(results.get(0).getHenkiloOid()).isEqualTo("OID");
        assertThat(results.get(0).getMasterOid()).isEqualTo("MASTER");
        
        given(this.henkiloViiteRepositoryMock.findBy(any())).willReturn(emptyList());
        results = this.service.findHenkiloViittees(new HenkiloCriteria());
        assertThat(results.size()).isEqualTo(0);

        // Assert split works as intended
        given(this.oppijanumerorekisteriProperties.getHenkiloViiteSplitSize()).willReturn(1);
        given(this.henkiloViiteRepositoryMock.findBy(any())).willReturn(singletonList(
                new HenkiloViiteDto("OID", "MASTER")));
        HenkiloCriteria criteria = new HenkiloCriteria() {{setHenkiloOids(Sets.newHashSet("OID1", "OID2"));}};
        results = this.service.findHenkiloViittees(criteria);
        assertThat(results).size().isEqualTo(2);
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDto() {
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", null, "fi", "suomi", "246", emptyList(), emptyList(), null, new Date());

        given(this.henkiloDataRepositoryMock.findByHetu(henkiloPerustietoDtoMock.getHetu())).willReturn(new ArrayList<>());
        doAnswer(returnsFirstArg()).when(this.service).createHenkilo(any(Henkilo.class));
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoMock).getDto())
                .isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloFoundByOid() {
        LocalDate syntymaaika = LocalDate.now();
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", null, null, syntymaaika, new Date());
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.VIRKAILIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);

        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any()))
                .willReturn(Optional.of(henkilo));
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoMock).getDto())
                .isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
        verify(this.henkiloDataRepositoryMock).findByOidHenkilo(eq(henkiloPerustietoDtoMock.getOidHenkilo()));
    }

    @Test(expected = NotFoundException.class)
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloNotFoundByOid() {
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", null, null, null, new Date());
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.VIRKAILIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");

        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any()))
                .willReturn(Optional.empty());
        this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoMock);
        verify(this.henkiloDataRepositoryMock).findByOidHenkilo(eq(henkiloPerustietoDtoMock.getOidHenkilo()));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloFoundByHetu() {
        LocalDate syntymaaika = LocalDate.now();
        Date modified = new Date();
        HenkiloPerustietoDto henkiloPerustietoDtoInput = DtoUtils.createHenkiloPerustietoDto(null, null, null,
                "123456-9999", null, null, null, null, null, null, syntymaaika, modified);
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "", "fi", "suomi", "246", null, null, syntymaaika, modified);
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "", false,
                HenkiloTyyppi.VIRKAILIJA, "fi", "suomi", "246", modified, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);


        given(this.henkiloDataRepositoryMock.findByHetu(henkiloPerustietoDtoInput.getHetu())).willReturn(Collections.singletonList(henkilo));
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoInput).getDto())
                .isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
    }

}
