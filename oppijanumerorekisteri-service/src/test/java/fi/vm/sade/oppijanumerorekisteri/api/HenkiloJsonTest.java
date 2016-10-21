package fi.vm.sade.oppijanumerorekisteri.api;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

// Probably not necessary if we don't want to return Henkilo objects through api. Serves as sample for API module.
@RunWith(SpringRunner.class)
@JsonTest
public class HenkiloJsonTest {
    @Autowired
    private JacksonTester<Henkilo> json;

    @Test
    public void testSerialize() throws Exception {
        Henkilo henkilo = new Henkilo();
        henkilo.setOidhenkilo("1.2.3.4.5");
        henkilo.setHetu("123456-9999");
        henkilo.setPassivoitu(false);

        assertThat(this.json.write(henkilo)).hasJsonPathBooleanValue("@.passivoitu")
                .extractingJsonPathBooleanValue("@.passivoitu").isFalse();
        assertThat(this.json.write(henkilo)).hasJsonPathStringValue("@.oidhenkilo")
                .extractingJsonPathStringValue("@.oidhenkilo").isEqualTo("1.2.3.4.5");
        assertThat(this.json.write(henkilo)).hasJsonPathStringValue("@.hetu")
                .extractingJsonPathStringValue("@.hetu").isEqualTo("123456-9999");
    }

    @Test
    public void testDeserialize() throws Exception {
        String content = "{\"passivoitu\": false, \"oidhenkilo\": \"1.2.3.4.5\", \"hetu\": \"123456-9999\"}";
        assertThat(this.json.parseObject(content).getHetu()).isEqualTo("123456-9999");
        assertThat(this.json.parseObject(content).getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(this.json.parseObject(content).isPassivoitu()).isFalse();
    }
}
