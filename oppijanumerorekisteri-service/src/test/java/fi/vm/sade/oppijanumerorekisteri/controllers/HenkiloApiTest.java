package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import org.joda.time.LocalDateTime;
import org.junit.Before;
import org.junit.Test;
import org.junit.BeforeClass;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class HenkiloApiTest extends OppijanumerorekisteriApiTest {
    @Autowired
    OidGenerator oidGenerator;
    @Autowired
    HenkiloRepository henkiloRepository;

    String oid;
    String eidasTunniste;

    @Before
    public void before() {
        oid = oidGenerator.generateOID();
        eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();

        var now = new LocalDateTime();
        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo(oid)
                .etunimet("Leon Elias")
                .kutsumanimi("Leon Elias")
                .sukunimi("Germany")
                .yksiloityEidas(true)
                .identifications(Set.of(
                        Identification.builder()
                                .idpEntityId(IdpEntityId.eidas)
                                .identifier(eidasTunniste)
                                .build()
                ))
                .created(now.toDate())
                .modified(now.toDate())
                .build());
    }

    @Test
    @UserRekisterinpitaja
    public void henkiloHasNoEidasTunnisteIfNotEidasYksilöity() throws Exception {
        var h = henkiloRepository.findByOidHenkilo(oid).get();
        h.setYksiloityEidas(false);
        henkiloRepository.save(h);

        var henkilo = getJson(HenkiloDto.class, "/henkilo/%s", oid);
        assertThat(henkilo.getOidHenkilo()).isEqualTo(oid);
        assertThat(henkilo.isYksiloityEidas()).isFalse();

        var identifications = getJsonArray(IdentificationDto.class, "/henkilo/%s/identification", oid);
        assertThat(identifications).hasSize(1);
        assertThat(identifications.get(0).getIdpEntityId()).isEqualTo(IdpEntityId.eidas);
        assertThat(identifications.get(0).getIdentifier()).isEqualTo(eidasTunniste);
    }

    @Test
    @UserRekisterinpitaja
    public void eidasHenkiloDto() throws Exception {
        var henkilo = getJson(HenkiloDto.class, "/henkilo/%s", oid);
        assertThat(henkilo.getOidHenkilo()).isEqualTo(oid);
        assertThat(henkilo.isYksiloityEidas()).isTrue();

        var identifications = getJsonArray(IdentificationDto.class, "/henkilo/%s/identification", oid);
        assertThat(identifications).hasSize(1);
        assertThat(identifications.get(0).getIdpEntityId()).isEqualTo(IdpEntityId.eidas);
        assertThat(identifications.get(0).getIdentifier()).isEqualTo(eidasTunniste);
    }

    @Test
    @UserRekisterinpitaja
    public void eidasHenkiloReadDto() throws Exception {
        var henkilo = getJson(HenkiloReadDto.class, "/henkilo/%s/master", oid);
        assertThat(henkilo.getOidHenkilo()).isEqualTo(oid);
        assertThat(henkilo.getYksiloityEidas()).isTrue();
    }
}