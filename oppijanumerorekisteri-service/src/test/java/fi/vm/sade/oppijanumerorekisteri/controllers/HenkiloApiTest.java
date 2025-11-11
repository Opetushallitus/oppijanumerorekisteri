package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.EidasTunniste;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

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

        var now = ZonedDateTime.now();
        henkiloRepository.save(Henkilo.builder()
                .oidHenkilo(oid)
                .etunimet("Leon Elias")
                .kutsumanimi("Leon Elias")
                .sukunimi("Germany")
                .yksiloityEidas(true)
                .eidasTunnisteet(List.of(EidasTunniste.builder()
                        .tunniste(eidasTunniste)
                        .createdBy(oidGenerator.generateOID())
                        .build()))
                .created(Date.from(now.toInstant()))
                .modified(Date.from(now.toInstant()))
                .build());
    }

    @Test
    @UserRekisterinpitaja
    public void henkiloHasNoEidasTunnisteIfNotEidasYksilöity() throws Exception {
        var h = henkiloRepository.findByOidHenkilo(oid).get();
        h.setYksiloityEidas(false);
        h.getEidasTunnisteet().clear();
        henkiloRepository.save(h);

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
    public void eidasHenkiloReadDto() throws Exception {
        var henkilo = getJson(HenkiloReadDto.class, "/henkilo/%s/master", oid);
        assertThat(henkilo.getOidHenkilo()).isEqualTo(oid);
        assertThat(henkilo.getYksiloityEidas()).isTrue();
        assertThat(henkilo.getEidasTunnisteet()).hasSize(1);
        assertThat(henkilo.getEidasTunnisteet().get(0).getTunniste()).isEqualTo(eidasTunniste);
    }
}