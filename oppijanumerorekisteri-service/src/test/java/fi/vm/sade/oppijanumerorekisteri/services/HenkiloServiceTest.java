package fi.vm.sade.oppijanumerorekisteri.services;


import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.mappers.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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
    private OrikaSpringMapper mapperMock;

    @Before
    public void setup() {
        this.henkiloJpaRepositoryMock = Mockito.mock(HenkiloHibernateRepository.class);
        this.henkiloDataRepositoryMock = Mockito.mock(HenkiloRepository.class);
        this.mapperMock = Mockito.mock(OrikaSpringMapper.class);
        MockOidGenerator mockOidGenerator = new MockOidGenerator();
        this.service = new HenkiloServiceImpl(this.henkiloJpaRepositoryMock,
                henkiloDataRepositoryMock, mapperMock, new YhteystietoConverter(), mockOidGenerator);
    }

    @Test
    public void getHasHetuTest() {
        given(this.henkiloJpaRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getHasHetu("1.2.3.4.5")).isTrue();
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
        assertThat(this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE).isPresent()).isFalse();
    }

    @Test
    public void getHenkiloYhteystiedotByRyhmaTest() {
        given(this.henkiloJpaRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        Optional<YhteystiedotDto> tiedot = this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE);
        assertThat(tiedot.isPresent()).isTrue();
        assertThat(tiedot.orElse(new YhteystiedotDto()).getKatuosoite()).isEqualTo("Siilikuja 6");
    }

    @Test
    public void generateOidTest() {
        String oid = ReflectionTestUtils.invokeMethod(service, "getFreePersonOid");
        assertThat(oid).isNotNull();
    }

    @Test
    public void getHenkiloKoskiPerustietoByOidsTest() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
                "fi", "suomi", "246", new Date());
        HenkiloKoskiDto henkiloKoskiDtoMock = DtoUtils.createHenkiloKoskiDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                "fi", "suomi", "246");
        given(this.henkiloDataRepositoryMock.findByOidhenkiloIsIn(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloMock));
        given(this.mapperMock.mapAsList(Collections.singletonList(henkiloMock), HenkiloKoskiDto.class))
                .willReturn(Collections.singletonList(henkiloKoskiDtoMock));
        List<HenkiloKoskiDto> henkiloKoskiDtoList = this.service.getHenkiloKoskiPerustietoByOids(Collections.singletonList("1.2.3.4.5"));
        HenkiloKoskiDto henkiloKoskiDto = henkiloKoskiDtoList.get(0);
        assertThat(henkiloKoskiDto.getHetu()).isEqualTo(henkiloMock.getHetu());
        assertThat(henkiloKoskiDto.getOidhenkilo()).isEqualTo(henkiloMock.getOidhenkilo());
        assertThat(henkiloKoskiDto.getEtunimet()).isEqualTo(henkiloMock.getEtunimet());
        assertThat(henkiloKoskiDto.getKutsumanimi()).isEqualTo(henkiloMock.getKutsumanimi());
        assertThat(henkiloKoskiDto.getSukunimi()).isEqualTo(henkiloMock.getSukunimi());
        assertThat(henkiloKoskiDto.getAidinkieli().getKielikoodi()).isEqualTo(henkiloMock.getAidinkieli().getKielikoodi());
        assertThat(henkiloKoskiDto.getAidinkieli().getKielityyppi()).isEqualTo(henkiloMock.getAidinkieli().getKielityyppi());
        assertThat(henkiloKoskiDto.getKansalaisuus().iterator().next().getKansalaisuuskoodi())
                .isEqualTo(henkiloMock.getKansalaisuus().iterator().next().getKansalaisuuskoodi());
    }

    @Test
    public void getHenkiloPerustietoByOidsTest() {
        Henkilo henkiloMock = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date());
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi");
        given(this.henkiloDataRepositoryMock.findByOidhenkiloIn(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloMock));
        given(this.mapperMock.mapAsList(Collections.singletonList(henkiloMock), HenkiloPerustietoDto.class))
                .willReturn(Collections.singletonList(henkiloPerustietoDtoMock));

        List<HenkiloPerustietoDto> henkiloPerustietoDtoList = this.service.getHenkiloPerustietoByOids(Collections.singletonList("1.2.3.4.5"));
        HenkiloPerustietoDto henkiloPerustietoDto = henkiloPerustietoDtoList.get(0);
        assertThat(henkiloPerustietoDto.getHetu()).isEqualTo(henkiloMock.getHetu());
        assertThat(henkiloPerustietoDto.getOidhenkilo()).isEqualTo(henkiloMock.getOidhenkilo());
        assertThat(henkiloPerustietoDto.getEtunimet()).isEqualTo(henkiloMock.getEtunimet());
        assertThat(henkiloPerustietoDto.getKutsumanimi()).isEqualTo(henkiloMock.getKutsumanimi());
        assertThat(henkiloPerustietoDto.getSukunimi()).isEqualTo(henkiloMock.getSukunimi());
        assertThat(henkiloPerustietoDto.getAidinkieli().getKielikoodi()).isEqualTo(henkiloMock.getAidinkieli().getKielikoodi());
        assertThat(henkiloPerustietoDto.getAidinkieli().getKielityyppi()).isEqualTo(henkiloMock.getAidinkieli().getKielityyppi());
        assertThat(henkiloPerustietoDto.getAsiointikieli().getKielikoodi()).isEqualTo(henkiloMock.getAsiointikieli().getKielikoodi());
        assertThat(henkiloPerustietoDto.getAsiointikieli().getKielityyppi()).isEqualTo(henkiloMock.getAsiointikieli().getKielityyppi());
    }


}
