package fi.vm.sade.oppijanumerorekisteri.services;


import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.configurations.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.KOTIOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.TYOOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.models.YhteystietoTyyppi.*;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.any;

public class HenkiloServiceTest {
    private HenkiloHibernateRepository henkiloJpaRepositoryMock;
    private HenkiloRepository henkiloDataRepositoryMock;
    private HenkiloService service;
    private OrikaConfiguration mapperMock;
    private UserDetailsHelper userDetailsHelperMock;
    private PermissionChecker permissionCheckerMock;

    @Before
    public void setup() {
        this.henkiloJpaRepositoryMock = Mockito.mock(HenkiloHibernateRepository.class);
        this.henkiloDataRepositoryMock = Mockito.mock(HenkiloRepository.class);
        this.mapperMock = Mockito.mock(OrikaConfiguration.class);
        MockOidGenerator mockOidGenerator = new MockOidGenerator();
        this.userDetailsHelperMock = Mockito.mock(UserDetailsHelper.class);
        KielisyysRepository kielisyysRepositoryMock = Mockito.mock(KielisyysRepository.class);
        KoodistoService koodistoServiceMock = Mockito.mock(KoodistoService.class);
        KansalaisuusRepository kansalaisuusRepositoryMock = Mockito.mock(KansalaisuusRepository.class);
        IdentificationRepository identificationRepositoryMock = Mockito.mock(IdentificationRepository.class);
        this.permissionCheckerMock = Mockito.mock(PermissionChecker.class);

        this.service = new HenkiloServiceImpl(this.henkiloJpaRepositoryMock, henkiloDataRepositoryMock, mapperMock,
                new YhteystietoConverter(), mockOidGenerator, this.userDetailsHelperMock, kielisyysRepositoryMock,
                koodistoServiceMock, kansalaisuusRepositoryMock, identificationRepositoryMock, this.permissionCheckerMock);
    }

    @Test
    public void getHasHetuTest() {
        given(this.userDetailsHelperMock.getCurrentUserOid()).willReturn(Optional.of("1.2.3.4.5"));
        given(this.henkiloJpaRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getHasHetu()).isTrue();
    }

    @Test
    public void getHasHetuNotFoundTest() {
        given(this.userDetailsHelperMock.getCurrentUserOid()).willReturn(Optional.of("1.2.3.4.5"));
        given(this.henkiloJpaRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.empty());
        assertThat(this.service.getHasHetu()).isFalse();
    }

    @Test
    public void getOidExistsTest() {
        given(this.henkiloDataRepositoryMock.exists(any(Predicate.class))).willReturn(true);
        assertThat(this.service.getOidExists("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidByHetuTest() {
        given(this.henkiloJpaRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getOidByHetu("1.2.3.4.5")).isEqualTo("123456-9999");
    }

    @Test
    public void getHetusAndOidsTest() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1");
        HenkiloHetuAndOidDto henkiloHetuAndOidDto = DtoUtils.createHenkiloHetuAndOidDto("1.2.3.4.5", "123456-9999",
                new Date(0L));

        given(this.henkiloJpaRepositoryMock.findHetusAndOids(null, 0, 100))
                .willReturn(Collections.singletonList(henkiloMock));
        given(this.mapperMock.mapAsList(Collections.singletonList(henkiloMock), HenkiloHetuAndOidDto.class))
                .willReturn(Collections.singletonList(henkiloHetuAndOidDto));

        assertThat(this.service.getHetusAndOids(null, 0, 100).get(0)).isEqualTo(henkiloHetuAndOidDto);
    }

    @Test(expected = NotFoundException.class)
    public void getOidByHetuNotFoundTest() {
        given(this.henkiloJpaRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.empty());
        this.service.getOidByHetu("1.2.3.4.5");
    }

    @Test
    public void getHenkiloYhteystiedotTest() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        HenkilonYhteystiedotViewDto results = this.service.getHenkiloYhteystiedot("1.2.3.4.5");
        assertThat(results).isNotNull();
        assertThat(results.asMap()).isNotNull();
        assertThat(results.asMap().size()).isEqualTo(2);
        
        YhteystiedotDto tyo = results.get(TYOOSOITE);
        assertThat(tyo).isNotNull();
        assertThat(tyo.getKatuosoite()).isEqualTo("Työkatu 3");
        assertThat(tyo.getSahkoposti()).isEqualTo("testaaja@oph.fi");
        assertThat(tyo.getPuhelinnumero()).isEqualTo("04512345678");
        
        YhteystiedotDto koti = results.get(KOTIOSOITE);
        assertThat(koti).isNotNull();
        assertThat(koti.getKatuosoite()).isEqualTo("Siilikuja 6");
        assertThat(koti.getSahkoposti()).isEqualTo("testaaja@pp.inet.fi");
        assertThat(koti.getPuhelinnumero()).isNull();
    }

    private List<YhteystietoHakuDto> testYhteystiedot(String henkiloOid) {
        return asList(
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus(KOTIOSOITE.getRyhmanKuvaus())
                    .yhteystietoTyyppi(YHTEYSTIETO_KATUOSOITE)
                    .arvo("Siilikuja 6")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus(KOTIOSOITE.getRyhmanKuvaus())
                    .yhteystietoTyyppi(YHTEYSTIETO_SAHKOPOSTI)
                    .arvo("testaaja@pp.inet.fi")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus(TYOOSOITE.getRyhmanKuvaus())
                    .yhteystietoTyyppi(YHTEYSTIETO_KATUOSOITE)
                    .arvo("Työkatu 3")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus(TYOOSOITE.getRyhmanKuvaus())
                    .yhteystietoTyyppi(YHTEYSTIETO_SAHKOPOSTI)
                    .arvo("testaaja@oph.fi")
                .build(),
            YhteystietoHakuDto.builder().henkiloOid(henkiloOid)
                    .ryhmaKuvaus(TYOOSOITE.getRyhmanKuvaus())
                    .yhteystietoTyyppi(YHTEYSTIETO_PUHELINNUMERO)
                    .arvo("04512345678")
                .build()
        );
    }

    @Test
    public void getHenkiloYhteystiedotByRyhmaEmptyTest() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(emptyList());
        assertThat(this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE)).isEmpty();
    }

    @Test
    public void getHenkiloYhteystiedotByRyhmaTest() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        Optional<YhteystiedotDto> tiedot = this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE);
        assertThat(tiedot.map(YhteystiedotDto::getKatuosoite)).hasValue("Siilikuja 6");
    }

    @Test
    public void generateOidTest() {
        String oid = ReflectionTestUtils.invokeMethod(service, "getFreePersonOid");
        assertThat(oid).isNotNull();
    }

    @Test
    public void getHenkiloPerustietoByOidsTest() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1");
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1");
        given(this.henkiloDataRepositoryMock.findByOidhenkiloIsIn(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloMock));
        given(this.mapperMock.mapAsList(Collections.singletonList(henkiloMock), HenkiloPerustietoDto.class))
                .willReturn(Collections.singletonList(henkiloPerustietoDtoMock));

        List<HenkiloPerustietoDto> henkiloPerustietoDtoList = this.service.getHenkiloPerustietoByOids(Collections.singletonList("1.2.3.4.5"));
        HenkiloPerustietoDto henkiloPerustietoDto = henkiloPerustietoDtoList.get(0);
        assertThat(henkiloPerustietoDto).isEqualTo(henkiloPerustietoDtoMock);
    }

    @Test
    public void getHenkiloOidHetuNimiByNameTest() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1");
        List<Henkilo> henkiloMockList = Collections.singletonList(henkiloMock);
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDtoMock = DtoUtils.createHenkiloOidHetuNimiDto("arpa noppa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5");
        List<String> etunimetList = Stream.of("arpa", "noppa").collect(Collectors.toList());
        given(this.henkiloJpaRepositoryMock.findHenkiloOidHetuNimisByEtunimetOrSukunimi(etunimetList, "kuutio"))
                .willReturn(henkiloMockList);
        given(this.mapperMock.mapAsList(henkiloMockList, HenkiloOidHetuNimiDto.class))
                .willReturn(Collections.singletonList(henkiloOidHetuNimiDtoMock));

        List<HenkiloOidHetuNimiDto> henkiloOidHetuNimiDtoList = this.service.getHenkiloOidHetuNimiByName("arpa noppa", "kuutio");
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = henkiloOidHetuNimiDtoList.get(0);
        assertThat(henkiloOidHetuNimiDto).isEqualTo(henkiloOidHetuNimiDtoMock);
    }

    @Test(expected = NotFoundException.class)
    public void getHenkiloOidHetuNimiByHetuNotFoundTest() {
        given(this.henkiloDataRepositoryMock.findByHetu("123456-9999")).willReturn(Optional.empty());
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
}
