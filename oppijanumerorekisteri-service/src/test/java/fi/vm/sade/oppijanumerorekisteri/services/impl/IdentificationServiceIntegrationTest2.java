package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@Transactional
@IntegrationTest
@Sql("/sql/yksilointi-test2.sql")
public class IdentificationServiceIntegrationTest2 {
    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private UserDetailsHelper userDetailsHelper;

    @Autowired
    private IdentificationService identificationService;

    @PersistenceContext
    private EntityManager entityManager;

    // Virkailija has no hetu and names match. No one is using the new hetu.
    @Test
    public void setStrongIdentifiedHetuNoHetuNamesMatch() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("new hetu", "Teppo Taneli", "Testaaja");

        this.identificationService.setStrongIdentifiedHetu("NoHetu", henkiloVahvaTunnistusDto);

        Henkilo henkiloHetuUpdated = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'NoHetu'", Henkilo.class).getSingleResult();
        assertThat(henkiloHetuUpdated.getHetu()).isEqualTo("new hetu");
    }

    // Virkailija has no hetu and names match. Oppija has the provided hetu taken already.
    @Test
    public void setStrongIdentifiedHetuCombineWithOppija() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("010101-234R", "Teppo Taneli", "Testaaja");

        this.identificationService.setStrongIdentifiedHetu("NoHetu", henkiloVahvaTunnistusDto);

        Henkilo henkiloHetuUpdated = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'NoHetu'", Henkilo.class).getSingleResult();
        Henkilo henkiloOppijaPassivoitu = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'EverythingOkOppija'", Henkilo.class).getSingleResult();
        assertThat(henkiloHetuUpdated.getHetu()).isEqualTo("010101-234R");
        assertThat(henkiloHetuUpdated.isPassivoitu()).isFalse();
        assertThat(henkiloOppijaPassivoitu.getHetu()).isNull();
        assertThat(henkiloOppijaPassivoitu.isPassivoitu()).isTrue();
    }

    // Hetu matches to virkailija and names match.
    @Test
    public void setStrongIdentifiedHetuHetuAndNimetMatch() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("010101-123N", "Teppo Taneli", "Testaaja");

        this.identificationService.setStrongIdentifiedHetu("EverythingOK", henkiloVahvaTunnistusDto);

        Henkilo henkiloHetuUpdated = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'EverythingOK'", Henkilo.class).getSingleResult();
        assertThat(henkiloHetuUpdated.getHetu()).isEqualTo("010101-123N");
    }

    // Hetu matches to virkailija and names do not match.
    @Test(expected = DataInconsistencyException.class)
    public void setStrongIdentifiedHetuHetuAndNimetNoMatch() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("010101-123N", "Wrong first name", "Testaaja");

        this.identificationService.setStrongIdentifiedHetu("EverythingOK", henkiloVahvaTunnistusDto);
    }

    // Hetu already used by other virkailija
    @Test(expected = RuntimeException.class)
    public void setStrongIdentifiedHetu() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("111111-1235", "Teppo", "Testaaja");

        this.identificationService.setStrongIdentifiedHetu("EverythingOK", henkiloVahvaTunnistusDto);
    }

}
