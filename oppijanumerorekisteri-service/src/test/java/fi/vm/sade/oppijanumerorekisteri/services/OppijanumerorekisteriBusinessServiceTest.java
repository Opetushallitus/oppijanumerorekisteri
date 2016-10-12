package fi.vm.sade.oppijanumerorekisteri.services;


import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.impl.OppijanumerorekisteriBusinessServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

public class OppijanumerorekisteriBusinessServiceTest {
    private HenkiloHibernateRepository henkiloHibernateRepositoryMock;
    private HenkiloRepository henkiloJpaRepositoryMock;
    private OppijanumerorekisteriBusinessService service;

    @Before
    public void setup() {
        this.henkiloHibernateRepositoryMock = Mockito.mock(HenkiloHibernateRepository.class);
        this.henkiloJpaRepositoryMock = Mockito.mock(HenkiloRepository.class);
        this.service = new OppijanumerorekisteriBusinessServiceImpl(this.henkiloHibernateRepositoryMock, henkiloJpaRepositoryMock);
    }

    @Test
    public void serviceTest() {
        given(this.henkiloHibernateRepositoryMock.getHetuByOid("1.2.3.4.5")).willReturn("123456-9999");
        assertThat(this.service.getHasHetu("1.2.3.4.5")).isTrue();
    }
}
