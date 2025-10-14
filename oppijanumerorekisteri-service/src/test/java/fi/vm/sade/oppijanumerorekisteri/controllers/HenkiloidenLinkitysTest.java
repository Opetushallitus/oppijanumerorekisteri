package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.gson.JsonObject;
import fi.vm.sade.auditlog.Target;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.audit.OnrOperation;
import fi.vm.sade.oppijanumerorekisteri.audit.VirkailijaAuditLogger;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import org.joda.time.LocalDateTime;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class HenkiloidenLinkitysTest extends OppijanumerorekisteriApiTest {
    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private OidGenerator oidGenerator;
    @MockitoBean
    private VirkailijaAuditLogger auditLogger;
    @Captor
    private ArgumentCaptor<Target> auditCaptor;

    @Test
    @UserRekisterinpitaja
    public void linkitysProducesauditLog() throws Exception {
        LocalDateTime now = new LocalDateTime();

        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo("1.2.246.562.24.30171449858")
                .hetu("300146-042C")
                .kaikkiHetut(Set.of("300146-042C"))
                .etunimet("Maija")
                .kutsumanimi("Maija")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(true)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo("1.2.246.562.24.90017362330")
                .etunimet("Matti")
                .kutsumanimi("Matti")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(false)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        MvcResult result = mvc.perform(createRequest(
                post("/henkilo/1.2.246.562.24.30171449858/forcelink"),
                List.of("1.2.246.562.24.90017362330")
        )).andExpect(status().isOk()).andReturn();
        List<String> response = objectMapper.readValue(result.getResponse().getContentAsString(),
                TypeFactory.defaultInstance().constructCollectionType(List.class, String.class));
        assertThat(response).containsExactlyInAnyOrder("1.2.246.562.24.90017362330");

        assertFalse(henkiloRepository.findByOidHenkilo("1.2.246.562.24.30171449858").get().isDuplicate());
        assertTrue(henkiloRepository.findByOidHenkilo("1.2.246.562.24.90017362330").get().isDuplicate());
        assertLinked("1.2.246.562.24.30171449858", "1.2.246.562.24.90017362330");

        JsonObject masterAuditEvent = findAuditEventForHenkiloOid(OnrOperation.LINKITYS, "1.2.246.562.24.30171449858").get();
        assertThat(masterAuditEvent.get("lisatieto").getAsString())
                .isEqualTo("Henkilöön linkitetty duplikaatit: 1.2.246.562.24.90017362330");

        JsonObject duplicateAuditEvent = findAuditEventForHenkiloOid(OnrOperation.LINKITYS, "1.2.246.562.24.90017362330").get();
        assertThat(duplicateAuditEvent.get("lisatieto").getAsString())
                .isEqualTo("Henkilö merkitty duplikaatiksi ja linkitetty henkilöön 1.2.246.562.24.30171449858");
    }

    @Test
    @UserRekisterinpitaja
    public void linkityksenPurkuProducesauditLog() throws Exception {
        LocalDateTime now = new LocalDateTime();
        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo("1.2.246.562.24.95612182512")
                .hetu("170925-097T")
                .kaikkiHetut(Set.of("170925-097T"))
                .etunimet("Maija")
                .kutsumanimi("Maija")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(true)
                .duplicate(false)
                .created(now.toDate())
                .modified(now.toDate())
                .build());
        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo("1.2.246.562.24.60082090214")
                .etunimet("Matti")
                .kutsumanimi("Matti")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(false)
                .duplicate(true)
                .created(now.toDate())
                .modified(now.toDate())
                .build());
        henkiloViiteRepository.save(HenkiloViite.builder()
                .masterOid("1.2.246.562.24.95612182512")
                .slaveOid("1.2.246.562.24.60082090214")
                .build());

        assertLinked("1.2.246.562.24.95612182512", "1.2.246.562.24.60082090214");

        mvc.perform(delete("/henkilo/1.2.246.562.24.95612182512/unlink/1.2.246.562.24.60082090214"))
                .andExpect(status().isOk());

        assertNotLinked("1.2.246.562.24.95612182512", "1.2.246.562.24.60082090214");

        JsonObject masterAuditEvent = findAuditEventForHenkiloOid(OnrOperation.PURA_LINKITYS, "1.2.246.562.24.95612182512").get();
        assertThat(masterAuditEvent.get("lisatieto").getAsString())
                .isEqualTo("Linkitys henkilöön 1.2.246.562.24.60082090214 purettu");

        JsonObject duplicateAuditEvent = findAuditEventForHenkiloOid(OnrOperation.PURA_LINKITYS, "1.2.246.562.24.60082090214").get();
        assertThat(duplicateAuditEvent.get("lisatieto").getAsString())
                .isEqualTo("Linkitys henkilöön 1.2.246.562.24.95612182512 purettu");
    }

    @Test
    @UserRekisterinpitaja
    public void cantForceLinkVtjYksiloityDuplicate() throws Exception {
        LocalDateTime now = new LocalDateTime();

        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo("1.2.246.562.24.27411130238")
                .hetu("080274-0084")
                .kaikkiHetut(Set.of("080274-0084"))
                .etunimet("Maija")
                .kutsumanimi("Maija")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(true)
                .yksiloity(true)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo("1.2.246.562.24.16608157297")
                .hetu("131161-3476")
                .kaikkiHetut(Set.of("131161-3476"))
                .etunimet("Matti")
                .kutsumanimi("Matti")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(true)
                .yksiloity(true)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        mvc.perform(createRequest(
                post("/henkilo/1.2.246.562.24.27411130238/forcelink"),
                List.of("1.2.246.562.24.16608157297")
        )).andExpect(status().isBadRequest());
    }

    @Test
    @UserRekisterinpitaja
    public void linkitysResultingInDuplicateBecomingMasterIsNotAllowed() throws Exception {
        LocalDateTime now = new LocalDateTime();

        Henkilo original = henkiloRepository.save(Henkilo.builder()
                .oidHenkilo(oidGenerator.generateOID())
                .hetu("080863-924N")
                .kaikkiHetut(Set.of("080863-924N"))
                .etunimet("Maija")
                .kutsumanimi("Maija")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(true)
                .yksiloityEidas(false)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        Henkilo firstDuplicate = henkiloRepository.save(Henkilo.builder()
                .oidHenkilo(oidGenerator.generateOID())
                .etunimet("Maija")
                .kutsumanimi("Maija")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(false)
                .yksiloityEidas(false)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        mvc.perform(createRequest(
                post("/henkilo/" + original.getOidHenkilo() + "/link"),
                List.of(firstDuplicate.getOidHenkilo())
        )).andExpect(status().isOk());

        assertLinked(original.getOidHenkilo(), firstDuplicate.getOidHenkilo());

        Henkilo secondDuplicate = henkiloRepository.save(Henkilo.builder()
                .oidHenkilo(oidGenerator.generateOID())
                .etunimet("Maija")
                .kutsumanimi("Maija")
                .sukunimi("Mehiläinen")
                .yksiloityVTJ(false)
                .yksiloityEidas(false)
                .created(now.toDate())
                .modified(now.toDate())
                .build());

        mvc.perform(createRequest(
                post("/henkilo/" + firstDuplicate.getOidHenkilo() + "/link"),
                List.of(secondDuplicate.getOidHenkilo())
        )).andExpect(status().isBadRequest());

        assertLinked(original.getOidHenkilo(), firstDuplicate.getOidHenkilo());
        assertNotLinked(original.getOidHenkilo(), secondDuplicate.getOidHenkilo());
        assertNotLinked(firstDuplicate.getOidHenkilo(), secondDuplicate.getOidHenkilo());
    }

    void assertNotLinked(String masterOid, String slaveOid) {
        List<HenkiloViite> viitteet = henkiloViiteRepository.findByMasterOid(masterOid).stream().filter(viite -> viite.getSlaveOid().equals(slaveOid)).collect(Collectors.toList());
        assertEquals(0, viitteet.size(), "Expected henkilös " + masterOid + " and " + slaveOid + " to not be linked");
    }

    Optional<JsonObject> findAuditEventForHenkiloOid(OnrOperation operation, String henkiloOid) {
        verify(auditLogger, atLeast(0)).log(eq(operation), auditCaptor.capture(), any());
        Stream<JsonObject> auditLogEvents = auditCaptor.getAllValues().stream().map(Target::asJson);
        return auditLogEvents.filter(e -> henkiloOid.equals(e.get("henkiloOid").getAsString())).findFirst();
    }
}
