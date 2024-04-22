package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import software.amazon.awssdk.services.sns.SnsClient;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

import static fi.vm.sade.oppijanumerorekisteri.AssertPublished.assertPublished;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;
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
    private SnsClient snsClient;

    @MockBean
    private UserDetailsHelper userDetailsHelper;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private HenkiloRepository henkiloRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    // Virkailija has no hetu and names match. No one is using the new hetu.
    @Test
    public void setStrongIdentifiedHetuNoHetuNamesMatch() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("new hetu");

        this.identificationService.setStrongIdentifiedHetu("NoHetu", henkiloVahvaTunnistusDto);

        Henkilo henkiloHetuUpdated = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'NoHetu'", Henkilo.class).getSingleResult();
        assertThat(henkiloHetuUpdated.getHetu()).isEqualTo("new hetu");
        assertPublished(objectMapper, snsClient, 1, henkiloHetuUpdated.getOidHenkilo());
    }

    // Virkailija has no hetu and names match. Oppija has the provided hetu taken already.
    @Test
    public void setStrongIdentifiedHetuCombineWithOppija() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("010101-234R");

        this.identificationService.setStrongIdentifiedHetu("NoHetu", henkiloVahvaTunnistusDto);

        Henkilo henkiloHetuUpdated = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'NoHetu'", Henkilo.class).getSingleResult();
        Henkilo henkiloOppijaPassivoitu = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'EverythingOkOppija'", Henkilo.class).getSingleResult();
        assertThat(henkiloHetuUpdated.getHetu()).isEqualTo("010101-234R");
        assertThat(henkiloHetuUpdated.getKaikkiHetut()).containsExactly("010101-234R");
        assertThat(henkiloHetuUpdated.isPassivoitu()).isFalse();
        assertThat(henkiloOppijaPassivoitu.getHetu()).isNull();
        assertThat(henkiloOppijaPassivoitu.getKaikkiHetut()).isEmpty();
        assertThat(henkiloOppijaPassivoitu.isPassivoitu()).isTrue();
        assertPublished(objectMapper, snsClient, 2, henkiloHetuUpdated.getOidHenkilo(), henkiloOppijaPassivoitu.getOidHenkilo());
    }

    // Hetu matches to virkailija and names match.
    @Test
    public void setStrongIdentifiedHetuHetuAndNimetMatch() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("010101-123N");

        this.identificationService.setStrongIdentifiedHetu("EverythingOK", henkiloVahvaTunnistusDto);

        Henkilo henkiloHetuUpdated = (Henkilo)this.entityManager
                .createNativeQuery("SELECT * FROM henkilo WHERE oidhenkilo = 'EverythingOK'", Henkilo.class).getSingleResult();
        assertThat(henkiloHetuUpdated.getHetu()).isEqualTo("010101-123N");
        assertPublished(objectMapper, snsClient, 1, henkiloHetuUpdated.getOidHenkilo());
    }

    // Hetu already used by other virkailija
    @Test(expected = RuntimeException.class)
    public void setStrongIdentifiedHetu() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto =
                new HenkiloVahvaTunnistusDto("111111-1235");

        this.identificationService.setStrongIdentifiedHetu("EverythingOK", henkiloVahvaTunnistusDto);
        assertPublished(objectMapper, snsClient, 0);
    }

    @Test
    public void setStrongIdentifiedHetuUusiTyoosoite() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto = new HenkiloVahvaTunnistusDto("010101-123M");
        henkiloVahvaTunnistusDto.setTyosahkopostiosoite("etu.suku@example.com");

        identificationService.setStrongIdentifiedHetu("Tyoosoite", henkiloVahvaTunnistusDto);

        Henkilo henkilo = henkiloRepository.findByOidHenkilo("Tyoosoite").get();
        Set<YhteystiedotRyhma> yhteystietoryhmat = henkilo.getYhteystiedotRyhma();
        assertThat(yhteystietoryhmat)
                .extracting(YhteystiedotRyhma::getRyhmaKuvaus, YHTEYSTIETOARVOT, YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .containsExactly(tuple("yhteystietotyyppi2", singletonList("etu.suku@example.com"), "alkupera6"));
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void setStrongIdentifiedHetuVainLukuTyoosoite() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto = new HenkiloVahvaTunnistusDto("010101-123L");
        henkiloVahvaTunnistusDto.setTyosahkopostiosoite("etu.suku@example.com");

        identificationService.setStrongIdentifiedHetu("TyoosoiteVainLuku", henkiloVahvaTunnistusDto);

        Henkilo henkilo = henkiloRepository.findByOidHenkilo("TyoosoiteVainLuku").get();
        Set<YhteystiedotRyhma> yhteystietoryhmat = henkilo.getYhteystiedotRyhma();
        assertThat(yhteystietoryhmat)
                .extracting(YhteystiedotRyhma::getRyhmaKuvaus, YHTEYSTIETOARVOT, YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .containsExactlyInAnyOrder(
                        tuple("yhteystietotyyppi2", singletonList("tyoosoite@example.com"), "alkupera6"),
                        tuple("yhteystietotyyppi2", singletonList("etu.suku@example.com"), "alkupera2")
                );
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    public void setStrongIdentifiedHetuUusiTyoosoiteRyhma() {
        HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto = new HenkiloVahvaTunnistusDto("010101-123K");
        henkiloVahvaTunnistusDto.setTyosahkopostiosoite("etu.suku@example.com");

        identificationService.setStrongIdentifiedHetu("Kotiosoite", henkiloVahvaTunnistusDto);

        Henkilo henkilo = henkiloRepository.findByOidHenkilo("Kotiosoite").get();
        Set<YhteystiedotRyhma> yhteystietoryhmat = henkilo.getYhteystiedotRyhma();
        assertThat(yhteystietoryhmat)
                .extracting(YhteystiedotRyhma::getRyhmaKuvaus, YHTEYSTIETOARVOT, YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .containsExactlyInAnyOrder(
                        tuple("yhteystietotyyppi1", singletonList("kotiosoite@example.com"), "alkupera6"),
                        tuple("yhteystietotyyppi2", singletonList("etu.suku@example.com"), "alkupera2")
                );
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }
}
