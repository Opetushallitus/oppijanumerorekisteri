package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.type.TypeFactory;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuCriteriaDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import lombok.val;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Sql("/sql/truncate_data.sql")
public class ServiceToServiceApiTest extends OppijanumerorekisteriApiTest {
  @Autowired OidGenerator oidGenerator;
  @Autowired HenkiloRepository henkiloRepository;

  String oid;

  @Before
  public void before() {
    val now = ZonedDateTime.now();
    oid = oidGenerator.generateOID();

    henkiloRepository.save(
        Henkilo.builder()
            .oidHenkilo(oid)
            .etunimet("Leon")
            .kutsumanimi("Leon")
            .sukunimi("Germany")
            .created(Date.from(now.toInstant()))
            .modified(Date.from(now.toInstant()))
            .build());

    henkiloRepository.save(
        Henkilo.builder()
            .oidHenkilo(oidGenerator.generateOID())
            .etunimet("Schmeon")
            .kutsumanimi("Schmeon")
            .sukunimi("Schmermany")
            .created(Date.from(now.toInstant()))
            .modified(Date.from(now.toInstant()))
            .build());
  }

  @Test
  @UserRekisterinpitaja
  public void henkiloPerustiedotAsAdmin() throws Exception {
    var arrayType =
        TypeFactory.defaultInstance().constructCollectionType(List.class, HenkiloDto.class);
    var criteria = new HenkiloHakuCriteriaDto();
    criteria.setHenkiloOids(Set.of(oid));

    var result =
        mvc.perform(
                post("/s2s/henkilo/perustiedotAsAdmin")
                    .content(objectMapper.writeValueAsString(criteria))
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
    List<HenkiloDto> perustiedotList =
        objectMapper.readValue(result.getResponse().getContentAsString(), arrayType);
    assertThat(perustiedotList).hasSize(1);
    perustiedotList.stream()
        .forEach(
            perustiedot -> {
              assertThat(perustiedot.getEtunimet()).isEqualTo("Leon");
              assertThat(perustiedot.getSukunimi()).isEqualTo("Germany");
              assertThat(perustiedot.getKutsumanimi()).isEqualTo("Leon");
              assertThat(perustiedot.getOidHenkilo()).isEqualTo(oid);
            });
  }
}
