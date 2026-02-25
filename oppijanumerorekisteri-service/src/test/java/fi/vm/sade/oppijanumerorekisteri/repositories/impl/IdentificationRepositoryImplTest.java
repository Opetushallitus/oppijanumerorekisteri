package fi.vm.sade.oppijanumerorekisteri.repositories.impl;


import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import jakarta.persistence.EntityManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@Sql({"/turvakielto/truncate_data.sql"})
public class IdentificationRepositoryImplTest {

    @Autowired
    private EntityManager testEntityManager;

    @Autowired
    private IdentificationRepository identificationRepository;

    @Test
    public void returnsEmptyListForNonExistentPerson() {
        var identifications = identificationRepository.findByHenkiloOid("1.2.3.5");
        assertThat(identifications).isEmpty();
    }

    @Test
    public void returnsIdentificationsForPerson() {
        var emailIdentification = Identification.builder()
                .identifier("testi.testaaja@testi.fi")
                .idpEntityId(IdpEntityId.email)
                .build();
        var googleIdentification = Identification.builder()
                .identifier("testiTestaaja")
                .idpEntityId(IdpEntityId.google)
                .build();
        var oppijaTokenIdentification = Identification.builder()
                .identifier("testi.testaaja@testi.fi")
                .idpEntityId(IdpEntityId.oppijaToken)
                .build();
        var mockIdentifications = Set.of(emailIdentification, googleIdentification, oppijaTokenIdentification);
        var personOid = UUID.randomUUID().toString();
        var person = createPerson(personOid, "", mockIdentifications);
        persistPerson(person);

        var foundIdentifications = identificationRepository.findByHenkiloOid(personOid);
        assertThat(foundIdentifications)
                .extracting("idpEntityId", "identifier")
                .containsExactlyInAnyOrder(
                        tuple(emailIdentification.getIdpEntityId(), emailIdentification.getIdentifier()),
                        tuple(googleIdentification.getIdpEntityId(), googleIdentification.getIdentifier()),
                        tuple(oppijaTokenIdentification.getIdpEntityId(), oppijaTokenIdentification.getIdentifier())
                );
    }

    @Test
    public void returnsIdenticalIdentifications() {
        var emailIdentifier = "testi.testaaja@testi.fi";
        var person1EmailIdentification = Identification.builder()
                .identifier(emailIdentifier)
                .idpEntityId(IdpEntityId.email)
                .build();
        var person2EmailIdentification = Identification.builder()
                .identifier(emailIdentifier)
                .idpEntityId(IdpEntityId.email)
                .build();

        var person1Oid = UUID.randomUUID().toString();
        var person1 = createPerson(person1Oid, "hetu1", Set.of(person1EmailIdentification));
        persistPerson(person1);
        var person2Oid = UUID.randomUUID().toString();
        var person2 = createPerson(person2Oid, "hetu2", Set.of(person2EmailIdentification));
        persistPerson(person2);

        var foundIdentifications = identificationRepository.findIdentical(
                IdentificationDto.of(IdpEntityId.email, emailIdentifier)
        );

        assertThat(foundIdentifications)
                .extracting("idpEntityId", "identifier")
                .containsExactlyInAnyOrder(
                        tuple(IdpEntityId.email, emailIdentifier),
                        tuple(IdpEntityId.email, emailIdentifier)
                );
    }

    private Henkilo createPerson(String oid, String hetu, Set<Identification> identifications) {
        var current = new Date();
        return Henkilo.builder()
                .oidHenkilo(oid)
                .etunimet("Testi")
                .kutsumanimi("Testi")
                .sukunimi("Testaaja")
                .hetu(hetu)
                .identifications(identifications)
                .created(current)
                .modified(current)
                .build();
    }

    private void persistPerson(Henkilo henkilo) {
        this.testEntityManager.persist(henkilo);
    }
}
