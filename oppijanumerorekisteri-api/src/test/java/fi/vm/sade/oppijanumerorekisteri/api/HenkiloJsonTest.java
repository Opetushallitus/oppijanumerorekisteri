package fi.vm.sade.oppijanumerorekisteri.api;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@JsonTest
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
        assertThat(this.oidNimiHetuJson.read("/henkilo/testHenkiloOidHetuNimiDto.json").getObject()).isEqualToComparingFieldByFieldRecursively(henkiloOidHetuNimiDto);
    }

    @Test
    public void testHenkiloPerustietoDtoSerialize() throws Exception {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1");
        assertThat(this.perustietoJson.write(henkiloPerustietoDto)).isEqualToJson("/henkilo/testHenkiloPerustietoDto.json");
    }

    @Test
    public void testHenkiloPerustietoDtoDeserialize() throws Exception {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1");
        assertThat(this.perustietoJson.read("/henkilo/testHenkiloPerustietoDto.json").getObject()).isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDto);
    }

    @Test
    public void testHenkiloDtoSerialize() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1");
        assertThat(this.henkiloDtoJson.write(henkiloDto)).isEqualToJson("/henkilo/testHenkiloDto.json");
    }

    @Test
    public void testHenkiloDtoDeserialize() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1");
        assertThat(this.henkiloDtoJson.read("/henkilo/testHenkiloDto.json").getObject())
                .isEqualToComparingFieldByFieldRecursively(henkiloDto);
    }

    @Test
    public void testSerializeYhteystiedot() throws IOException {
        HenkilonYhteystiedotViewDto dto = new HenkilonYhteystiedotViewDto()
                .put(YhteystietoRyhma.KOTIOSOITE, YhteystiedotDto.builder()
                        .sahkoposti("testi@test.com")
                        .matkapuhelinnumero("+358451234567")
                        .katuosoite("Testikatu 2")
                        .kunta("Toijala")
                        .postinumero("12345")
                        .kaupunki("Toijala")
                        .maa("Suomi")
                    .build())
                .put(YhteystietoRyhma.TYOOSOITE, YhteystiedotDto.builder()
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
