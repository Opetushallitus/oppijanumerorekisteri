package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.Oauth2Client;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.NoContentOrNotFoundException;
import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import fi.vm.sade.oppijanumerorekisteri.utils.YhteystietoryhmaUtils;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import software.amazon.awssdk.services.sns.SnsClient;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.http.HttpRequest;
import java.util.List;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@Sql("/sql/truncate_data.sql")
public class HenkiloModificationServiceTest {

    @Autowired
    private HenkiloModificationService henkiloModificationService;
    @Autowired
    private DatabaseService databaseService;
    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private IdentificationRepository identificationRepository;
    @MockitoBean
    private SnsClient snsClient;
    @MockitoBean
    private Oauth2Client oauth2Client;
    @MockitoBean
    private KoodistoClient koodistoClient;
    @MockitoBean
    private HenkiloService henkiloService;

    @Test
    @WithMockUser
    public void linkHenkilosWithoutIdentification() {
        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .identifications(singleton(new Identification(IdpEntityId.email, "value1")))
                .build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .identifications(emptySet())
                .build();
        slave = henkiloModificationService.createHenkilo(slave);

        List<String> slaves = henkiloModificationService.linkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));

        assertThat(slaves).containsExactly(slave.getOidHenkilo());
        assertThat(identificationRepository.findByHenkiloOid(master.getOidHenkilo()))
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .containsExactlyInAnyOrder(tuple(IdpEntityId.email, "value1"));
        assertThat(identificationRepository.findByHenkiloOid(slave.getOidHenkilo()))
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .isEmpty();
    }

    @Test
    @WithMockUser
    public void linkHenkilosWithIdentification() {
        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .identifications(singleton(new Identification(IdpEntityId.email, "value1")))
                .build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .identifications(singleton(new Identification(IdpEntityId.email, "value2")))
                .build();
        slave = henkiloModificationService.createHenkilo(slave);

        List<String> slaves = henkiloModificationService.linkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));

        assertThat(slaves).containsExactly(slave.getOidHenkilo());
        assertThat(identificationRepository.findByHenkiloOid(master.getOidHenkilo()))
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .containsExactlyInAnyOrder(tuple(IdpEntityId.email, "value1"), tuple(IdpEntityId.email, "value2"));
        assertThat(identificationRepository.findByHenkiloOid(slave.getOidHenkilo()))
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .isEmpty();
    }

    @Test
    @WithMockUser
    public void linkHenkilosWithKansalaisuus() {
        when(koodistoClient.getKoodisForKoodisto(eq("maatjavaltiot2"), anyInt(), anyBoolean()))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2)
                        .koodi("kansalaisuus1").koodi("kansalaisuus2").koodi("kansalaisuus3")
                        .build());

        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .kansalaisuus(Stream.of("kansalaisuus1").map(Kansalaisuus::new).collect(toSet()))
                .build();
        final String masterOid = henkiloModificationService.createHenkilo(master).getOidHenkilo();
        Henkilo slave1 = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .kansalaisuus(Stream.of("kansalaisuus2").map(Kansalaisuus::new).collect(toSet()))
                .build();
        final String slave1oid = henkiloModificationService.createHenkilo(slave1).getOidHenkilo();
        Henkilo slave2 = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .kansalaisuus(Stream.of("kansalaisuus2", "kansalaisuus3").map(Kansalaisuus::new).collect(toSet()))
                .build();
        final String slave2oid = henkiloModificationService.createHenkilo(slave2).getOidHenkilo();

        List<String> slaves = henkiloModificationService.linkHenkilos(masterOid, asList(slave1oid, slave2oid));

        assertThat(slaves).containsExactlyInAnyOrder(slave1.getOidHenkilo(), slave2.getOidHenkilo());
        databaseService.runInTransaction(() -> {
            assertThat(henkiloRepository.findByOidHenkilo(masterOid).get().getKansalaisuus())
                    .extracting(Kansalaisuus::getKansalaisuusKoodi)
                    .containsExactlyInAnyOrder("kansalaisuus1", "kansalaisuus2", "kansalaisuus3");
            assertThat(henkiloRepository.findByOidHenkilo(slave1oid).get().getKansalaisuus())
                    .extracting(Kansalaisuus::getKansalaisuusKoodi)
                    .containsExactlyInAnyOrder("kansalaisuus2");
            assertThat(henkiloRepository.findByOidHenkilo(slave2oid).get().getKansalaisuus())
                    .extracting(Kansalaisuus::getKansalaisuusKoodi)
                    .containsExactlyInAnyOrder("kansalaisuus2", "kansalaisuus3");
        });
    }

    @Test
    @WithMockUser
    public void linkHenkilosWithAidinkieli() {
        when(koodistoClient.getKoodisForKoodisto(eq("kieli"), anyInt(), anyBoolean()))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI)
                        .koodi("fi").koodi("sv").koodi("en")
                        .build());

        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .aidinkieli(new Kielisyys("fi"))
                .build();
        final String masterOid = henkiloModificationService.createHenkilo(master).getOidHenkilo();
        Henkilo slave1 = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .aidinkieli(new Kielisyys("sv"))
                .build();
        final String slave1oid = henkiloModificationService.createHenkilo(slave1).getOidHenkilo();
        Henkilo slave2 = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .aidinkieli(new Kielisyys("en"))
                .build();
        final String slave2oid = henkiloModificationService.createHenkilo(slave2).getOidHenkilo();

        List<String> slaves = henkiloModificationService.linkHenkilos(masterOid, asList(slave1oid, slave2oid));

        assertThat(slaves).containsExactlyInAnyOrder(slave1.getOidHenkilo(), slave2.getOidHenkilo());
        databaseService.runInTransaction(() -> {
            assertThat(henkiloRepository.findByOidHenkilo(masterOid).get().getAidinkieli())
                    .returns("fi", Kielisyys::getKieliKoodi);
            assertThat(henkiloRepository.findByOidHenkilo(slave1oid).get().getAidinkieli())
                    .returns("sv", Kielisyys::getKieliKoodi);
            assertThat(henkiloRepository.findByOidHenkilo(slave2oid).get().getAidinkieli())
                    .returns("en", Kielisyys::getKieliKoodi);
        });
    }

    @Test
    @WithMockUser
    public void linkHenkilosWithoutAidinkieli() {
        when(koodistoClient.getKoodisForKoodisto(eq("kieli"), anyInt(), anyBoolean()))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI)
                        .koodi("fi").koodi("sv").koodi("en")
                        .build());

        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .aidinkieli(null)
                .build();
        final String masterOid = henkiloModificationService.createHenkilo(master).getOidHenkilo();
        Henkilo slave1 = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .aidinkieli(new Kielisyys("sv"))
                .build();
        final String slave1oid = henkiloModificationService.createHenkilo(slave1).getOidHenkilo();
        Henkilo slave2 = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .aidinkieli(new Kielisyys("en"))
                .build();
        final String slave2oid = henkiloModificationService.createHenkilo(slave2).getOidHenkilo();

        List<String> slaves = henkiloModificationService.linkHenkilos(masterOid, asList(slave1oid, slave2oid));

        assertThat(slaves).containsExactlyInAnyOrder(slave1.getOidHenkilo(), slave2.getOidHenkilo());
        databaseService.runInTransaction(() -> {
            assertThat(henkiloRepository.findByOidHenkilo(masterOid).get().getAidinkieli())
                    .returns("sv", Kielisyys::getKieliKoodi);
            assertThat(henkiloRepository.findByOidHenkilo(slave1oid).get().getAidinkieli())
                    .returns("sv", Kielisyys::getKieliKoodi);
            assertThat(henkiloRepository.findByOidHenkilo(slave2oid).get().getAidinkieli())
                    .returns("en", Kielisyys::getKieliKoodi);
        });
    }

    @Test
    @WithMockUser
    public void removeAccessRights() {
        henkiloModificationService.removeAccessRights("1.2.3.4.5");
        ArgumentCaptor<HttpRequest.Builder> request = ArgumentCaptor.forClass(HttpRequest.Builder.class);
        verify(oauth2Client, times(1)).executeRequest(request.capture());
        assertThat(request.getValue().build().uri().toString())
                .isEqualTo("https://localhost/kayttooikeus-service/henkilo/1.2.3.4.5/passivoi?kasittelijaOid=user");
        verify(henkiloService, times(1))
                .removeContactInfo("1.2.3.4.5", YhteystietoryhmaUtils.TYYPPI_TYOOSOITE);
    }

    @Test
    @WithMockUser
    public void testForceLinkHappyPath() {
        Henkilo master = Henkilo.builder().etunimet("master").kutsumanimi("master").sukunimi("master").sukupuoli(null).build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("slave").kutsumanimi("slave").sukunimi("slave").sukupuoli(null).build();
        slave = henkiloModificationService.createHenkilo(slave);

        List<String> slaves = henkiloModificationService.forceLinkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));

        assertThat(slaves).containsExactly(slave.getOidHenkilo());
    }

    @Test
    @WithMockUser
    public void testForceLinkSlaveYksiloity() {
        Henkilo master = Henkilo.builder().etunimet("master").kutsumanimi("master").sukunimi("master").sukupuoli(null).build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("slave").kutsumanimi("slave").sukunimi("slave").sukupuoli(null).yksiloity(true).build();
        slave = henkiloModificationService.createHenkilo(slave);

        List<String> slaves = henkiloModificationService.forceLinkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));

        assertThat(slaves).containsExactly(slave.getOidHenkilo());
    }

    @Test(expected = ValidationException.class)
    @WithMockUser
    public void testForceLinkSlaveVtjYksiloity() {
        Henkilo master = Henkilo.builder().etunimet("master").kutsumanimi("master").sukunimi("master").sukupuoli(null).build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("slave").kutsumanimi("slave").sukunimi("slave").sukupuoli(null).yksiloityVTJ(true).build();
        slave = henkiloModificationService.createHenkilo(slave);

        henkiloModificationService.forceLinkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));
    }

    @Test(expected = ValidationException.class)
    @WithMockUser
    public void testForceLinkSlaveHasHetu() {
        Henkilo master = Henkilo.builder().etunimet("master").kutsumanimi("master").sukunimi("master").sukupuoli(null).build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("slave").kutsumanimi("slave").sukunimi("slave").sukupuoli(null).hetu("fakehetu").build();
        slave = henkiloModificationService.createHenkilo(slave);

        henkiloModificationService.forceLinkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));
    }

    @Test
    @WithMockUser
    public void testForceLinkDoesNotFailIfPassivoiHenkiloNotFound() {
        doThrow(new NoContentOrNotFoundException("404")).when(oauth2Client).executeRequest(any());
        Henkilo master = Henkilo.builder().etunimet("master").kutsumanimi("master").sukunimi("master").sukupuoli(null).build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("slave").kutsumanimi("slave").sukunimi("slave").sukupuoli(null).yksiloity(true).build();
        slave = henkiloModificationService.createHenkilo(slave);

        List<String> slaves = henkiloModificationService.forceLinkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));

        assertThat(slaves).containsExactly(slave.getOidHenkilo());
    }
}
