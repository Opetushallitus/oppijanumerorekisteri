package fi.vm.sade.oppijanumerorekisteri.services;


import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.impl.HenkiloServiceImpl;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

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
        this.service = new HenkiloServiceImpl(this.henkiloHibernateRepositoryMock,
                henkiloJpaRepositoryMock, mapperMock);
    }

    @Test
    public void getHasHetu() {
        given(this.henkiloHibernateRepositoryMock.getHetuByOid("1.2.3.4.5")).willReturn("123456-9999");
        assertThat(this.service.getHasHetu("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidExists() {
        given(this.henkiloJpaRepositoryMock.exists(any(Predicate.class))).willReturn(true);
        assertThat(this.service.getOidExists("1.2.3.4.5")).isTrue();
    }

    @Test
    public void getOidByHetu() {
        given(this.henkiloHibernateRepositoryMock.getOidByHetu("1.2.3.4.5")).willReturn("123456-9999");
        assertThat(this.service.getOidByHetu("1.2.3.4.5")).isEqualTo("123456-9999");
    }
}
