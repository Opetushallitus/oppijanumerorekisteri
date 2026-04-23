package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.KoodiTypeBuilder;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.EidasTunniste;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class HenkiloApiTest extends OppijanumerorekisteriApiTest {
    @Autowired
    OidGenerator oidGenerator;
    @Autowired
    HenkiloRepository henkiloRepository;
    @Autowired
    KielisyysRepository kielisyysRepository;
    @MockitoBean
    KoodistoService koodistoService;

    public String createHenkilo(List<EidasTunniste> eidasTunnisteet) {
        String oid = oidGenerator.generateOID();

        var now = ZonedDateTime.now();
        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo(oid)
                .etunimet("Leon Elias")
                .kutsumanimi("Leon Elias")
                .sukunimi("Germany")
                .yksiloityEidas(eidasTunnisteet != null)
                .eidasTunnisteet(eidasTunnisteet)
                .created(Date.from(now.toInstant()))
                .modified(Date.from(now.toInstant()))
                .build());
        return oid;
    }

    @Test
    @UserRekisterinpitaja
    public void henkiloHasNoEidasTunnisteIfNotEidasYksilöity() throws Exception {
        var oid = createHenkilo(null);

        var henkilo = getJson(HenkiloDto.class, "/henkilo/%s", oid);
        assertThat(henkilo.getOidHenkilo()).isEqualTo(oid);
        assertThat(henkilo.isYksiloityEidas()).isFalse();
        assertThat(henkilo.getEidasTunnisteet()).isEmpty();

        var identifications = getJsonArray(IdentificationDto.class, "/henkilo/%s/identification", oid);
        assertThat(identifications).isEmpty();
    }

    @Test
    @UserRekisterinpitaja
    public void eidasHenkiloDto() throws Exception {
        String eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var oid = createHenkilo(List.of(EidasTunniste.builder()
                        .tunniste(eidasTunniste)
                        .createdBy(oidGenerator.generateOID())
                        .build()));
        var henkilo = getJson(HenkiloDto.class, "/henkilo/%s", oid);
        assertThat(henkilo.getOidHenkilo()).isEqualTo(oid);
        assertThat(henkilo.isYksiloityEidas()).isTrue();
        assertThat(henkilo.getEidasTunnisteet()).hasSize(1);
        var tunniste = henkilo.getEidasTunnisteet().get(0);
        assertThat(tunniste.getTunniste()).isEqualTo(eidasTunniste);

        var identifications = getJsonArray(IdentificationDto.class, "/henkilo/%s/identification", oid);
        assertThat(identifications).isEmpty();
    }

    @Test
    @UserRekisterinpitaja
    public void returnsBadRequestWhenTryingToPostDuplicateIdentifier() throws Exception {
        initKoodistoMock();
        String eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var oppijaTokenIdentification = Identification.builder()
                .idpEntityId(IdpEntityId.oppijaToken)
                .identifier("testi.same.person.duplicate@testi.fi")
                .build();
        var person = createPerson(eidasTunniste, Set.of(oppijaTokenIdentification));
        henkiloRepository.save(person);

        mvc.perform(createRequest(
                post(String.format("/henkilo/%s/identification", person.getOidHenkilo())),
                IdentificationDto.of(
                        oppijaTokenIdentification.getIdpEntityId(),
                        oppijaTokenIdentification.getIdentifier()
                ))
        ).andExpect(status().isBadRequest());
    }

    @Test
    @UserRekisterinpitaja
    public void returnsBadRequestWhenTryingToAddIdentificationAnotherPersonAlreadyHas() throws Exception {
        initKoodistoMock();

        var eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var person1EmailIdentification = Identification.builder()
                .idpEntityId(IdpEntityId.email)
                .identifier("testi.other.person.duplicate@testi.fi")
                .build();
        var person = createPerson(eidasTunniste, Set.of(person1EmailIdentification));
        henkiloRepository.save(person);

        var secondPersonEidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var secondPersonEmailIdentification = Identification.builder()
                .idpEntityId(IdpEntityId.email)
                .identifier("testi.other.person.duplicate2@testi.fi")
                .build();
        var person2 = createPerson(secondPersonEidasTunniste, Set.of(secondPersonEmailIdentification));
        henkiloRepository.save(person2);

        mvc.perform(createRequest(
                post(String.format("/henkilo/%s/identification", person2.getOidHenkilo())),
                IdentificationDto.of(person1EmailIdentification.getIdpEntityId(), person1EmailIdentification.getIdentifier()))
        ).andExpect(status().isBadRequest());
    }

    @Test
    @UserRekisterinpitaja
    public void successfullyAddsUniqueIdentification() throws Exception {
        initKoodistoMock();

        String eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var emailIdentification = Identification.builder()
                .idpEntityId(IdpEntityId.email)
                .identifier("testi.success@testi.fi")
                .build();
        var person = createPerson(eidasTunniste, Set.of(emailIdentification));
        henkiloRepository.save(person);

        var initialIdentifications = getJsonArray(IdentificationDto.class, "/henkilo/%s/identification", person.getOidHenkilo());
        assertThat(initialIdentifications)
                .extracting(
                        IdentificationDto::getIdpEntityId,
                        IdentificationDto::getIdentifier
                )
                .containsExactlyInAnyOrder(
                        tuple(emailIdentification.getIdpEntityId(), emailIdentification.getIdentifier())
                );

        var findByIdentificationResult = getJson(
                HenkiloDto.class,
                "/henkilo/identification?idp=%s&id=%s",
                emailIdentification.getIdpEntityId(),
                emailIdentification.getIdentifier());
        assertThat(findByIdentificationResult.getOidHenkilo()).isEqualTo(person.getOidHenkilo());

        // Attempt to add a new identification for person
        mvc.perform(createRequest(
                post(String.format("/henkilo/%s/identification", person.getOidHenkilo())),
                IdentificationDto.of(IdpEntityId.oppijaToken, emailIdentification.getIdentifier()))
        ).andExpect(status().isOk());

        var identifications = getJsonArray(IdentificationDto.class, "/henkilo/%s/identification", person.getOidHenkilo());
        assertThat(identifications)
                .extracting(
                        IdentificationDto::getIdpEntityId,
                        IdentificationDto::getIdentifier)
                .containsExactlyInAnyOrder(
                        tuple(IdpEntityId.oppijaToken, emailIdentification.getIdentifier()),
                        tuple(IdpEntityId.email, emailIdentification.getIdentifier())
                );
    }

    @Test
    @UserRekisterinpitaja
    public void returnsConflictWhenFetchingPersonWithDuplicateIdentification() throws Exception {
        var identificationDto = IdentificationDto.of(IdpEntityId.email, "testi.fetch.duplicate@testi.fi");
        String person1EidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var emailIdentificationPerson1 = Identification.builder()
                .idpEntityId(identificationDto.getIdpEntityId())
                .identifier(identificationDto.getIdentifier())
                .build();
        var person1 = createPerson(person1EidasTunniste, Set.of(emailIdentificationPerson1));
        henkiloRepository.save(person1);

        String person2EidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var emailIdentificationPerson2 = Identification.builder()
                .idpEntityId(identificationDto.getIdpEntityId())
                .identifier(identificationDto.getIdentifier())
                .build();
        var person2 = createPerson(person2EidasTunniste, Set.of(emailIdentificationPerson2));
        henkiloRepository.save(person2);

        mvc.perform(
                get(String.format("/henkilo/identification?idp=%s&id=%s",
                        identificationDto.getIdpEntityId(),
                        identificationDto.getIdentifier())))
                .andExpect(status().is(409)).andReturn();
    }

    private void initKoodistoMock() {
        KoodiUpdateDto oppijaTokenKoodi = new KoodiUpdateDto("oppijaToken");
        KoodiUpdateDto emailKoodi = new KoodiUpdateDto("email");
        when(koodistoService.list(Koodisto.HENKILON_TUNNISTETYYPIT)).thenReturn(
                List.of(
                        new KoodiTypeBuilder(Koodisto.HENKILON_TUNNISTETYYPIT, oppijaTokenKoodi.getKoodi()).versio(1).build(),
                        new KoodiTypeBuilder(Koodisto.HENKILON_TUNNISTETYYPIT, emailKoodi.getKoodi()).versio(1).build()
                )
        );

        when(koodistoService.list(Koodisto.SUKUPUOLI))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.SUKUPUOLI).koodi("1").koodi("2").build());

        when(koodistoService.list(Koodisto.KIELI))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("FI").koodi("SV").koodi("EN").build());
    }

    private Henkilo createPerson(String eidasTunniste, Set<Identification> identifications) {
        var eidasTunnisteet = List.of(EidasTunniste.builder()
                .tunniste(eidasTunniste)
                .createdBy(oidGenerator.generateOID())
                .build());
        String oid = oidGenerator.generateOID();

        var now = ZonedDateTime.now();
        return Henkilo.builder()
                .oidHenkilo(oid)
                .etunimet("Leon Elias")
                .kutsumanimi("Leon Elias")
                .sukunimi("Germany")
                .yksiloityEidas(eidasTunnisteet != null)
                .eidasTunnisteet(eidasTunnisteet)
                .identifications(identifications)
                .created(Date.from(now.toInstant()))
                .modified(Date.from(now.toInstant()))
                .build();
    }

    @Test
    @Transactional
    @UserRekisterinpitaja
    public void updateHenkiloAndGetOmattiedot() throws Exception {
        initKoodistoMock();

        var henkilo = createRekisterinPitajaHenkilo("fi", "fi");
        this.henkiloRepository.save(henkilo);

        var omattiedotResponse = getJson(HenkiloOmattiedotDto.class, "/henkilo/current/omattiedot");
        assertThat(omattiedotResponse.getAsiointikieli()).isEqualTo("fi");

        var henkiloUpdate = new HenkiloUpdateDto();
        henkiloUpdate.setOidHenkilo(USER_REKISTERINPITAJA_OID);
        // Set asiointikieli to swedish
        henkiloUpdate.setAsiointiKieli(
                KielisyysDto.builder()
                        .kieliKoodi("sv")
                        .kieliTyyppi("svenska")
                        .build());
        var henkiloUpdateRequest = createRequest(put("/henkilo"), henkiloUpdate);
        mvc.perform(henkiloUpdateRequest).andExpect(status().isOk());

        var omattiedotResponse2 = getJson(HenkiloOmattiedotDto.class, "/henkilo/current/omattiedot");
        assertThat(omattiedotResponse2.getAsiointikieli()).isEqualTo("sv");
    }

    @Test
    @Transactional
    @UserRekisterinpitaja
    public void currentOmattiedotReturnsUnmodifiedLanguage() throws Exception {
        initKoodistoMock();
        var rekisterinPitaja = createRekisterinPitajaHenkilo("FI", "fi");
        henkiloRepository.save(rekisterinPitaja);

        var omattiedotResponse = getJson(HenkiloOmattiedotDto.class, "/henkilo/current/omattiedot");
        assertThat(omattiedotResponse.getAsiointikieli()).isEqualTo("FI");
    }

    @Test
    @Transactional
    @UserRekisterinpitaja
    public void failsToUpdateHenkiloWhenAidinkieliIsInUppercase() throws Exception {
        initKoodistoMock();
        var aidinkieli = "FI";
        var rekisterinPitaja = createRekisterinPitajaHenkilo("fi", aidinkieli);
        henkiloRepository.save(rekisterinPitaja);

        var henkiloUpdate = new HenkiloUpdateDto();
        henkiloUpdate.setOidHenkilo(USER_REKISTERINPITAJA_OID);
        henkiloUpdate.setAsiointiKieli(
                KielisyysDto.builder()
                        .kieliKoodi("sv")
                        .kieliTyyppi("svenska")
                        .build());
        // Use the aidinkieli that the user already has, which is "FI", not "fi"
        henkiloUpdate.setAidinkieli(
                KielisyysDto.builder()
                        .kieliKoodi(aidinkieli)
                        .kieliTyyppi("suomi")
                        .build());
        var henkiloUpdateRequest = createRequest(put("/henkilo"), henkiloUpdate);
        mvc.perform(henkiloUpdateRequest).andExpect(status().isBadRequest());
    }

    private Henkilo.builder createDefaultRekisterinPitajaBuilder() {
        String eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
        var eidasTunnisteet = new ArrayList<EidasTunniste>();
        eidasTunnisteet.add(EidasTunniste.builder().tunniste(eidasTunniste).createdBy(oidGenerator.generateOID()).build());
        var now = ZonedDateTime.now();
        var henkiloBuilder = Henkilo.builder()
                .oidHenkilo(USER_REKISTERINPITAJA_OID)
                .etunimet("Testi Testaaja")
                .kutsumanimi("Testi")
                .sukunimi("Testiläinen")
                .sukupuoli("1")
                .yksiloityEidas(eidasTunnisteet != null)
                .eidasTunnisteet(eidasTunnisteet)
                .created(Date.from(now.toInstant()))
                .modified(Date.from(now.toInstant()));

        return henkiloBuilder;
    }

    private Henkilo createRekisterinPitajaHenkilo(String asiointikielikoodi, String aidinkielikoodi) {
        var asiointikieliKielisyys = kielisyysRepository.findOrCreateByKoodi(asiointikielikoodi);
        var aidinkieliKielisyys = kielisyysRepository.findOrCreateByKoodi(aidinkielikoodi);
        var henkiloBuilder = createDefaultRekisterinPitajaBuilder();
        henkiloBuilder.asiointiKieli(asiointikieliKielisyys);
        henkiloBuilder.aidinkieli(aidinkieliKielisyys);

        return henkiloBuilder.build();
    }
}