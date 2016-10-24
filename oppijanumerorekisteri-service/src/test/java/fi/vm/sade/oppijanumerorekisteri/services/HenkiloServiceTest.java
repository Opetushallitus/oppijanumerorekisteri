package fi.vm.sade.oppijanumerorekisteri.services;


import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
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
    private HenkiloHibernateRepository henkiloHibernateRepositoryMock;
    private HenkiloRepository henkiloJpaRepositoryMock;
    private HenkiloService service;

    @Before
    public void setup() {
        this.henkiloHibernateRepositoryMock = Mockito.mock(HenkiloHibernateRepository.class);
        this.henkiloJpaRepositoryMock = Mockito.mock(HenkiloRepository.class);
        OrikaSpringMapper mapperMock = Mockito.mock(OrikaSpringMapper.class);
        MockOidGenerator mockOidGenerator = new MockOidGenerator();
        this.service = new HenkiloServiceImpl(this.henkiloHibernateRepositoryMock,
                henkiloJpaRepositoryMock, mapperMock, new YhteystietoConverter(), mockOidGenerator);
    }

    @Test
    public void getHasHetu() {
        given(this.henkiloHibernateRepositoryMock.findHetuByOid("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getHasHetu("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidExists() {
        given(this.henkiloJpaRepositoryMock.exists(any(Predicate.class))).willReturn(true);
        assertThat(this.service.getOidExists("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidByHetu() {
        given(this.henkiloHibernateRepositoryMock.findOidByHetu("1.2.3.4.5")).willReturn(Optional.of("123456-9999"));
        assertThat(this.service.getOidByHetu("1.2.3.4.5")).isEqualTo("123456-9999");
    }

    @Test
    public void getHenkiloYhteystiedot() {
        given(this.henkiloHibernateRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
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
    public void getHenkiloYhteystiedotByRyhmaEmpty() {
        given(this.henkiloHibernateRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(emptyList());
        assertThat(this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE).isPresent()).isFalse();
    }

    @Test
    public void getHenkiloYhteystiedotByRyhma() {
        given(this.henkiloHibernateRepositoryMock.findYhteystiedot(any(YhteystietoCriteria.class)))
                .willReturn(testYhteystiedot("1.2.3.4.5"));
        Optional<YhteystiedotDto> tiedot = this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE);
        assertThat(tiedot.isPresent()).isTrue();
        assertThat(tiedot.get().getKatuosoite()).isEqualTo("Siilikuja 6");
    }

    @Test
    public void generateOid() {
        String oid = ReflectionTestUtils.invokeMethod(service, "getFreePersonOid");
        assertThat(oid).isNotNull();
    }
}
