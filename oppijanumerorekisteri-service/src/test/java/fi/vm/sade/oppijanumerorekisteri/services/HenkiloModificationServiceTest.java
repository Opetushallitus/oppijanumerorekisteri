package fi.vm.sade.oppijanumerorekisteri.services;

import com.amazonaws.services.sns.AmazonSNS;
import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@IntegrationTest
public class HenkiloModificationServiceTest {

    @Autowired
    private HenkiloModificationService henkiloModificationService;
    @Autowired
    private DatabaseService databaseService;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private IdentificationRepository identificationRepository;
    @MockBean
    private AmazonSNS amazonSns;
    @MockBean
    private KayttooikeusClient kayttooikeusClient;
    @MockBean
    private KoodistoClient koodistoClient;

    @After
    public void cleanup() {
        databaseService.truncate();
    }

    @Test
    @WithMockUser
    public void linkHenkilosWithoutIdentification() {
        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .identifications(singleton(new Identification("key1", "value1", null, null, null)))
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
                .containsExactlyInAnyOrder(tuple("key1", "value1"));
        assertThat(identificationRepository.findByHenkiloOid(slave.getOidHenkilo()))
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .isEmpty();
    }

    @Test
    @WithMockUser
    public void linkHenkilosWithIdentification() {
        Henkilo master = Henkilo.builder().etunimet("etu1").kutsumanimi("etu1").sukunimi("suku1")
                .sukupuoli(null)
                .identifications(singleton(new Identification("key1", "value1", null, null, null)))
                .build();
        master = henkiloModificationService.createHenkilo(master);
        Henkilo slave = Henkilo.builder().etunimet("etu2").kutsumanimi("etu2").sukunimi("suku2")
                .sukupuoli(null)
                .identifications(singleton(new Identification("key2", "value2", null, null, null)))
                .build();
        slave = henkiloModificationService.createHenkilo(slave);

        List<String> slaves = henkiloModificationService.linkHenkilos(master.getOidHenkilo(), asList(slave.getOidHenkilo()));

        assertThat(slaves).containsExactly(slave.getOidHenkilo());
        assertThat(identificationRepository.findByHenkiloOid(master.getOidHenkilo()))
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .containsExactlyInAnyOrder(tuple("key1", "value1"), tuple("key2", "value2"));
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

}
