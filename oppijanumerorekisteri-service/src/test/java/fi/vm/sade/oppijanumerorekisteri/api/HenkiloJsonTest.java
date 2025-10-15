package fi.vm.sade.oppijanumerorekisteri.api;

import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Month;
import java.util.Date;
import java.util.List;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@JsonTest
@ContextConfiguration(classes = OppijanumerorekisteriServiceApplication.class)
public class HenkiloJsonTest {
    @Autowired
    private JacksonTester<HenkiloOidHetuNimiDto> oidNimiHetuJson;

    @Autowired
    private JacksonTester<HenkiloPerustietoDto> perustietoJson;

    @Autowired
    private JacksonTester<HenkiloDto> henkiloDtoJson;

    @Autowired
    private JacksonTester<HenkilonYhteystiedotViewDto> yhteystiedotJson;

    @Test
    public void testHenkiloOidHetuNimiDtoSerialize() throws Exception {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5");
        assertThat(this.oidNimiHetuJson.write(henkiloOidHetuNimiDto)).isEqualToJson("/henkilo/testHenkiloOidHetuNimiDto.json");
    }

    @Test
    public void testHenkiloOidHetuNimiDtoDeserialize() throws Exception {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5");
        assertThat(this.oidNimiHetuJson.read("/henkilo/testHenkiloOidHetuNimiDto.json").getObject()).usingRecursiveComparison().isEqualTo(henkiloOidHetuNimiDto);
    }

    @Test
    public void testHenkiloPerustietoDtoSerialize() throws Exception {
        LocalDate syntymaaika = LocalDate.of(2016, Month.DECEMBER, 20);
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), singletonList(IdentificationDto.of(IdpEntityId.oppijaToken, "value1")), syntymaaika, new Date(29364800000L));
        assertThat(this.perustietoJson.write(henkiloPerustietoDto)).isEqualToJson("/henkilo/testHenkiloPerustietoDto.json");
    }

    @Test
    public void testHenkiloPerustietoDtoDeserialize() throws Exception {
        LocalDate syntymaaika = LocalDate.of(2016, Month.DECEMBER, 20);
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), singletonList(IdentificationDto.of(IdpEntityId.oppijaToken, "value1")), syntymaaika, new Date(29364800000L));
        assertThat(this.perustietoJson.read("/henkilo/testHenkiloPerustietoDto.json").getObject()).usingRecursiveComparison().isEqualTo(henkiloPerustietoDto);
    }

    @Test
    public void testHenkiloDtoSerialize() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        assertThat(this.henkiloDtoJson.write(henkiloDto)).isEqualToJson("/henkilo/testHenkiloDto.json");
    }

    @Test
    public void testHenkiloDtoDeserialize() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        assertThat(this.henkiloDtoJson.read("/henkilo/testHenkiloDto.json").getObject())
                .usingRecursiveComparison().isEqualTo(henkiloDto);
    }

    @Test
    public void testHenkiloDtoDeserializeEidas() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("Leon Elias", "Leon Elias", "Germany", null, "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "+49 69 1234 5678");
        henkiloDto.setYksiloityEidas(true);
        henkiloDto.setEidasTunnisteet(List.of(EidasTunnisteDto.builder().tunniste("DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5").build()));
        var parsed = this.henkiloDtoJson.read("/henkilo/testHenkiloDto-eidas.json").getObject();
        assertThat(parsed).usingRecursiveComparison().isEqualTo(henkiloDto);
        assertThat(parsed.isYksiloityEidas()).isTrue();
        assertThat(parsed.getEidasTunnisteet()).hasSize(1);
    }

    @Test
    public void testHenkiloDtoDeserializePreEidas() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        var parsed = this.henkiloDtoJson.read("/henkilo/testHenkiloDto-noeidas.json").getObject();
        assertThat(parsed).usingRecursiveComparison().isEqualTo(henkiloDto);
        assertThat(parsed.isYksiloityEidas()).isFalse();
        assertThat(parsed.getEidasTunnisteet()).isEmpty();
    }

    @Test
    public void testSerializeYhteystiedot() throws IOException {
        HenkilonYhteystiedotViewDto dto = new HenkilonYhteystiedotViewDto()
                .put("yhteystietotyyppi1", YhteystiedotDto.builder()
                        .sahkoposti("testi@test.com")
                        .matkapuhelinnumero("+358451234567")
                        .katuosoite("Testikatu 2")
                        .kunta("Toijala")
                        .postinumero("12345")
                        .kaupunki("Toijala")
                        .maa("Suomi")
                    .build())
                .put("yhteystietotyyppi2", YhteystiedotDto.builder()
                        .sahkoposti("tyo@osoite.fi")
                        .puhelinnumero("01234567")
                        .matkapuhelinnumero("+3584040404")
                        .katuosoite("Työkatu 6")
                        .kunta("Vilppula")
                        .postinumero("54321")
                        .kaupunki("Vilppula")
                    .build());
        assertThat(this.yhteystiedotJson.write(dto))
                .isEqualToJson("/henkilo/testYhteystiedotViewDto.json");
    }
}
