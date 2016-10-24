package fi.vm.sade.oppijanumerorekisteri.api;

import fi.vm.sade.oppijanumerorekisteri.AbstractTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Test
    public void testSerialize() throws Exception {
        Henkilo henkilo = new Henkilo();
        henkilo.setOidhenkilo("1.2.3.4.5");
        henkilo.setHetu("123456-9999");
        henkilo.setPassivoitu(false);

        assertThat(this.henkiloJson.write(henkilo)).hasJsonPathBooleanValue("@.passivoitu")
                .extractingJsonPathBooleanValue("@.passivoitu").isFalse();
        assertThat(this.henkiloJson.write(henkilo)).hasJsonPathStringValue("@.oidhenkilo")
                .extractingJsonPathStringValue("@.oidhenkilo").isEqualTo("1.2.3.4.5");
        assertThat(this.henkiloJson.write(henkilo)).hasJsonPathStringValue("@.hetu")
                .extractingJsonPathStringValue("@.hetu").isEqualTo("123456-9999");
    }

    @Test
    public void testDeserialize() throws Exception {
        String content = "{\"passivoitu\": false, \"oidhenkilo\": \"1.2.3.4.5\", \"hetu\": \"123456-9999\"}";
        assertThat(this.henkiloJson.parseObject(content).getHetu()).isEqualTo("123456-9999");
        assertThat(this.henkiloJson.parseObject(content).getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(this.henkiloJson.parseObject(content).isPassivoitu()).isFalse();
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
