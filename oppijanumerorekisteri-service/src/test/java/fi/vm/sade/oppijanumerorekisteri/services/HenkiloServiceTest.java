package fi.vm.sade.oppijanumerorekisteri.services;

import com.google.common.collect.Sets;
import com.querydsl.core.types.Predicate;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.oppijanumerorekisteri.KoodistoServiceMock;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi.*;
import static java.util.Arrays.asList;
import static java.util.Collections.*;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {OrikaConfiguration.class, KoodistoServiceMock.class}, webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class HenkiloServiceTest {
    @Autowired
    private OrikaConfiguration mapper;

    @Spy
    @InjectMocks
    private HenkiloServiceImpl service;

    @Mock
    private HenkiloViiteRepository henkiloViiteRepositoryMock;
    @Mock
    private HenkiloRepository henkiloDataRepositoryMock;
    @Mock
    private UserDetailsHelper userDetailsHelperMock;
    @Mock
    private PermissionChecker permissionCheckerMock;
    @Mock
    private KielisyysRepository kielisyysRepositoryMock;
    @Mock
    private KansalaisuusRepository kansalaisuusRepositoryMock;
    @Mock
    private OppijanumerorekisteriProperties oppijanumerorekisteriProperties;
    @Mock
    private KayttooikeusClient kayttooikeusClient;
    @Mock
    private HakuappClient hakuappClient;
    @Mock
    private AtaruClient ataruClient;
    @Mock
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;
    @Mock
    private HenkiloCreatePostValidator henkiloCreatePostValidator;
    @MockBean
    private KansalaisuusRepository kansalaisuusRepository;

    @Before
    public void setup() {
        ReflectionTestUtils.setField(this.service, "mapper", this.mapper);
        ReflectionTestUtils.setField(this.service, "yhteystietoConverter", new YhteystietoConverter());
    }

    @Test
    public void listShouldReturnEmptySliceWhenEmptySallitutHenkiloOids() {
        HenkiloHakuCriteria criteria = new HenkiloHakuCriteria();
        when(kayttooikeusClient.getHenkiloKayttooikeudet(any(), any())).thenReturn(KayttooikeudetDto.user(emptySet()));

        Slice<HenkiloHakuDto> slice = service.list(criteria, 1, 20);

        assertThat(slice.getResults()).isEmpty();
        verifyZeroInteractions(henkiloDataRepositoryMock);
    }

    @Test
    public void listShouldCreateSliceCorrectly() {
        HenkiloHakuCriteria criteria = new HenkiloHakuCriteria();
        when(kayttooikeusClient.getHenkiloKayttooikeudet(any(), any()))
                .thenReturn(KayttooikeudetDto.user(Stream.of("henkilo1", "henkilo2", "henkilo3").collect(toSet())));
        HenkiloHakuDto henkilo1 = HenkiloHakuDto.builder().oidHenkilo("1").build();
        HenkiloHakuDto henkilo2 = HenkiloHakuDto.builder().oidHenkilo("2").build();
        HenkiloHakuDto henkilo3 = HenkiloHakuDto.builder().oidHenkilo("3").build();
        when(henkiloDataRepositoryMock.findBy(any(HenkiloCriteria.class), anyLong(), anyLong()))
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
        verify(henkiloDataRepositoryMock).findBy(criteriaCaptor.capture(), eq(21L), eq(0L));
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
        verify(henkiloDataRepositoryMock).findBy(criteriaCaptor.capture(), eq(21L), eq(0L));
        HenkiloCriteria henkiloCriteria = criteriaCaptor.getValue();
        assertThat(henkiloCriteria.getHenkiloOids()).containsExactlyInAnyOrder("henkilo1", "henkilo3");
    }

    @Test
    public void getHasHetu() {
        given(this.userDetailsHelperMock.getCurrentUserOid()).willReturn("1.2.3.4.5");
        given(this.henkiloDataRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getHasHetu()).isTrue();
    }

    @Test
    public void getHasHetuNotFound() {
        given(this.userDetailsHelperMock.getCurrentUserOid()).willReturn("1.2.3.4.5");
        given(this.henkiloDataRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.empty());
        assertThat(this.service.getHasHetu()).isFalse();
    }

    @Test
    public void getOidExists() {
        given(this.henkiloDataRepositoryMock.exists(any(Predicate.class))).willReturn(true);
        assertThat(this.service.getOidExists("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidByHetu() {
        given(this.henkiloDataRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getOidByHetu("1.2.3.4.5")).isEqualTo("123456-9999");
    }

    @Test
    public void getOidByHetuWithKaikkiHetut() {
        given(this.henkiloDataRepositoryMock.findOidByKaikkiHetut("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getOidByHetu("1.2.3.4.5")).isEqualTo("123456-9999");
    }

    @Test
    public void getHetusAndOids() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(0L), "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloHetuAndOidDto henkiloHetuAndOidDto = DtoUtils.createHenkiloHetuAndOidDto("1.2.3.4.5", "123456-9999",
                new Date(0L));

        given(this.henkiloDataRepositoryMock.findHetusAndOids(null, 0, 100))
                .willReturn(Collections.singletonList(henkiloMock));

        assertThat(this.service.getHetusAndOids(null, 0, 100).get(0))
                .isEqualToComparingFieldByFieldRecursively(henkiloHetuAndOidDto);
    }

    @Test(expected = NotFoundException.class)
    public void getOidByHetuNotFound() {
        given(this.henkiloDataRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.empty());
        this.service.getOidByHetu("1.2.3.4.5");
    }

    @Test
    public void getHenkiloYhteystiedot() {
        given(this.henkiloDataRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
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
        given(this.henkiloDataRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(emptyList());
        assertThat(this.service.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi1")).isEmpty();
    }

    @Test
    public void getHenkiloYhteystiedotByRyhma() {
        given(this.henkiloDataRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        Optional<YhteystiedotDto> tiedot = this.service.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi1");
        assertThat(tiedot.map(YhteystiedotDto::getKatuosoite)).hasValue("Siilikuja 6");
    }

    @Test
    public void getHenkiloPerustietoByOidsTest() {
        Date modified = new Date();
        HenkiloPerustietoDto henkiloMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), emptyList(), null, modified);
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), emptyList(), null, modified);
        given(this.henkiloDataRepositoryMock.findByOidIn(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloMock));

        List<HenkiloPerustietoDto> henkiloPerustietoDtoList = this.service.getHenkiloPerustietoByOids(Collections.singletonList("1.2.3.4.5"));
        assertThat(henkiloPerustietoDtoList.size()).isEqualTo(1);
        HenkiloPerustietoDto henkiloPerustietoDto = henkiloPerustietoDtoList.get(0);
        assertThat(henkiloPerustietoDto).isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
    }

    @Test
    public void getHenkiloOidHetuNimiByName() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        List<Henkilo> henkiloMockList = Collections.singletonList(henkiloMock);
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDtoMock = DtoUtils.createHenkiloOidHetuNimiDto("arpa noppa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5");
        List<String> etunimetList = Stream.of("arpa", "noppa").collect(Collectors.toList());
        given(this.henkiloDataRepositoryMock.findHenkiloOidHetuNimisByEtunimetOrSukunimi(etunimetList, "kuutio"))
                .willReturn(henkiloMockList);

        List<HenkiloOidHetuNimiDto> henkiloOidHetuNimiDtoList = this.service.getHenkiloOidHetuNimiByName("arpa noppa", "kuutio");
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = henkiloOidHetuNimiDtoList.get(0);
        assertThat(henkiloOidHetuNimiDto).isEqualToComparingFieldByFieldRecursively(henkiloOidHetuNimiDtoMock);
    }

    @Test(expected = NotFoundException.class)
    public void getHenkiloOidHetuNimiByHetuNotFound() {
        given(this.henkiloDataRepositoryMock.findOidHetuNimiByHetu("123456-9999")).willReturn(Optional.empty());
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
}
