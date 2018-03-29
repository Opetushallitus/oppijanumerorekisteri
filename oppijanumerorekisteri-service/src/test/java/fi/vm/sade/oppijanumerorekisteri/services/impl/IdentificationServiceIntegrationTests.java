package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import static java.util.Collections.singletonList;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import static java.util.stream.Collectors.toList;
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
import static org.assertj.core.api.Assertions.tuple;

@RunWith(SpringRunner.class)
@Transactional
@IntegrationTest
@Sql("/sql/yksilointi-test2.sql")
public class IdentificationServiceIntegrationTests {

    private static final Function<YhteystiedotRyhma, List<String>> YHTEYSTIETOARVOT = yhteystietoryhma
            -> yhteystietoryhma.getYhteystieto().stream().map(Yhteystieto::getYhteystietoArvo).collect(toList());

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private UserDetailsHelper userDetailsHelper;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private HenkiloRepository henkiloRepository;

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

    // Hetu already used by other virkailija
    @Test(expected = RuntimeException.class)
    public void setStrongIdentifiedHetu() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("111111-1235", "Teppo", "Testaaja");

        this.identificationService.setStrongIdentifiedHetu("EverythingOK", henkiloVahvaTunnistusDto);
    }

    @Test
    public void setStrongIdentifiedHetuUusiTyoosoite() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto = new HenkiloVahvaTunnistusDto("010101-123M");
        henkiloVahvaTunnistusDto.setTyosahkopostiosoite("etu.suku@example.com");

        identificationService.setStrongIdentifiedHetu("Tyoosoite", henkiloVahvaTunnistusDto);

        Set<YhteystiedotRyhma> yhteystietoryhmat = henkiloRepository.findByOidHenkilo("Tyoosoite").get().getYhteystiedotRyhma();
        assertThat(yhteystietoryhmat)
                .extracting(YhteystiedotRyhma::getRyhmaKuvaus, YHTEYSTIETOARVOT)
                .containsExactly(tuple("yhteystietotyyppi2", singletonList("etu.suku@example.com")));
    }

    @Test
    public void setStrongIdentifiedHetuVainLukuTyoosoite() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto = new HenkiloVahvaTunnistusDto("010101-123L");
        henkiloVahvaTunnistusDto.setTyosahkopostiosoite("etu.suku@example.com");

        identificationService.setStrongIdentifiedHetu("TyoosoiteVainLuku", henkiloVahvaTunnistusDto);

        Set<YhteystiedotRyhma> yhteystietoryhmat = henkiloRepository.findByOidHenkilo("TyoosoiteVainLuku").get().getYhteystiedotRyhma();
        assertThat(yhteystietoryhmat)
                .extracting(YhteystiedotRyhma::getRyhmaKuvaus, YHTEYSTIETOARVOT)
                .containsExactlyInAnyOrder(
                        tuple("yhteystietotyyppi2", singletonList("tyoosoite@example.com")),
                        tuple("yhteystietotyyppi2", singletonList("etu.suku@example.com"))
                );
    }

    @Test
    public void setStrongIdentifiedHetuUusiTyoosoiteRyhma() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto = new HenkiloVahvaTunnistusDto("010101-123K");
        henkiloVahvaTunnistusDto.setTyosahkopostiosoite("etu.suku@example.com");

        identificationService.setStrongIdentifiedHetu("Kotiosoite", henkiloVahvaTunnistusDto);

        Set<YhteystiedotRyhma> yhteystietoryhmat = henkiloRepository.findByOidHenkilo("Kotiosoite").get().getYhteystiedotRyhma();
        assertThat(yhteystietoryhmat)
                .extracting(YhteystiedotRyhma::getRyhmaKuvaus, YHTEYSTIETOARVOT)
                .containsExactlyInAnyOrder(
                        tuple("yhteystietotyyppi1", singletonList("kotiosoite@example.com")),
                        tuple("yhteystietotyyppi2", singletonList("etu.suku@example.com"))
                );
    }

}
