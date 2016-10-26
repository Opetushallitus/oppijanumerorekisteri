package fi.vm.sade.oppijanumerorekisteri.api;

import org.springframework.beans.factory.annotation.Autowired;
import fi.vm.sade.oppijanumerorekisteri.AbstractTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloKoskiDto;
import fi.vm.sade.oppijanumerorekisteri.mappers.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

// Probably not necessary if we don't want to return Henkilo objects through api. Serves as sample for API module.
@RunWith(SpringRunner.class)
@JsonTest
public class HenkiloJsonTest extends AbstractTest {
    @Autowired
    private JacksonTester<Henkilo> henkiloJson;
    @Autowired
    private JacksonTester<HenkilonYhteystiedotViewDto> yhteystiedotJson;
    @Autowired
    private JacksonTester<HenkiloKoskiDto> koskiJson;

    @Test
    public void testHenkiloKoskiDtoSerialize() throws Exception {
        HenkiloKoskiDto henkiloKoskiDto = DtoUtils.createHenkiloKoskiDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246");

        assertThat(this.koskiJson.write(henkiloKoskiDto)).hasJsonPathStringValue("@.oidhenkilo")
                .extractingJsonPathStringValue("@.oidhenkilo").isEqualTo("1.2.3.4.5");
        assertThat(this.koskiJson.write(henkiloKoskiDto)).hasJsonPathStringValue("@.hetu")
                .extractingJsonPathStringValue("@.hetu").isEqualTo("123456-9999");
    }

    @Test
    public void testHenkiloKoskiDtoDeserialize() throws Exception {
        String content = "{\"passivoitu\": false, \"oidhenkilo\": \"1.2.3.4.5\", \"hetu\": \"123456-9999\"}";
        assertThat(this.koskiJson.parseObject(content).getHetu()).isEqualTo("123456-9999");
        assertThat(this.koskiJson.parseObject(content).getOidhenkilo()).isEqualTo("1.2.3.4.5");
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
                .isEqualToJson(jsonResource("classpath:henkilo/testYhteystiedot.json"));
    }
}
