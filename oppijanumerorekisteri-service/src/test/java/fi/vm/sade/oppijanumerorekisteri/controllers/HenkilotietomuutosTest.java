package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.joda.time.LocalDateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class HenkilotietomuutosTest extends OppijanumerorekisteriApiTest {
    @Autowired private HenkiloRepository henkiloRepository;

    @Test
    @WithMockUser(authorities = "ROLE_APP_OPPIJANUMEROREKISTERI_MUUTOSTIETOPALVELU")
    public void hetuChangedButOppijaWithTheNewHetuAlreadyExists() throws Exception{
        LocalDateTime now = new LocalDateTime();

        Henkilo original = new Henkilo();
        original.setOidHenkilo("1.2.246.562.24.95356522807");
        original.setHetu("300146-042C");
        original.setKaikkiHetut(Set.of(original.getHetu()));
        original.setEtunimet("Maija");
        original.setKutsumanimi("Maija");
        original.setSukunimi("Mehiläinen");
        original.setVtjRegister(true);
        original.setYksiloityVTJ(true);
        original.setCreated(now.minusDays(200).toDate());
        original.setModified(original.getCreated());
        henkiloRepository.save(original);

        Henkilo duplicate = new Henkilo();
        duplicate.setOidHenkilo("1.2.246.562.24.33632474453");
        duplicate.setHetu("191123-693D");
        duplicate.setKaikkiHetut(Set.of(duplicate.getHetu()));
        duplicate.setEtunimet("Matti");
        duplicate.setKutsumanimi("Matti");
        duplicate.setSukunimi("Mehiläinen");
        duplicate.setVtjRegister(true);
        duplicate.setYksiloityVTJ(true);
        duplicate.setCreated(now.minusDays(100).toDate());
        duplicate.setModified(duplicate.getCreated());
        henkiloRepository.save(duplicate);

        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setOidHenkilo(duplicate.getOidHenkilo());
        henkiloForceUpdateDto.setHetu(duplicate.getHetu());
        henkiloForceUpdateDto.setKaikkiHetut(Set.of(original.getHetu(), duplicate.getHetu()));
        henkiloForceUpdateDto.setEtunimet("Matti");
        henkiloForceUpdateDto.setSukunimi("Mehiläinen");

        MvcResult result2 = mvc.perform(createRequest(put("/s2s/henkilo/muutostiedot"), henkiloForceUpdateDto))
                .andExpect(status().isOk()).andReturn();
        HenkiloForceReadDto response = objectMapper.readValue(result2.getResponse().getContentAsString(), HenkiloForceReadDto.class);
        // Response is actually just ignored in henkilomuutostieto service
        assertEquals(response.getOidHenkilo(), original.getOidHenkilo());

        verify(henkiloModifiedTopic, times(2)).publish(any());

        Henkilo originalAfter = getHenkiloWithKaikkiHetut(original.getOidHenkilo());
        assertThat(originalAfter.getHetu()).isEqualTo("191123-693D");
        assertThat(originalAfter.getKaikkiHetut()).containsExactlyInAnyOrder("191123-693D", "300146-042C");
        assertTrue(originalAfter.isYksiloityVTJ());
        assertFalse(originalAfter.isDuplicate());
        assertFalse(originalAfter.isPassivoitu());

        Henkilo duplicateAfter = getHenkiloWithKaikkiHetut(duplicate.getOidHenkilo());
        assertThat(duplicateAfter.getHetu()).isNull();
        assertThat(duplicateAfter.getKaikkiHetut()).isEmpty();
        assertFalse(duplicateAfter.isYksiloityVTJ());
        assertTrue(duplicateAfter.isDuplicate());
        assertTrue(duplicateAfter.isPassivoitu());

        assertLinked(original.getOidHenkilo(), duplicate.getOidHenkilo());
    }

    private Henkilo getHenkiloWithKaikkiHetut(String oid) {
        return this.entityManager.createQuery("SELECT h FROM Henkilo h LEFT JOIN FETCH h.kaikkiHetut WHERE h.oidHenkilo = :oid", Henkilo.class)
                .setParameter("oid", oid).getSingleResult();
    }

}
