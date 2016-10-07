package fi.vm.sade.oppijanumerorekisteri.client;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

// TODO: When external rest client is added use this kind of test
@RunWith(SpringRunner.class)
//@RestClientTest(SomeRestClient.class)
public class SomeClientTest {
//    @Autowired
//    private SomeRestClient client;

    @Autowired
    private MockRestServiceServer server;

    @Ignore
    @Test
    public void getVehicleDetailsWhenResultIsSuccessShouldReturnDetails()
            throws Exception {
//        this.server.expect(requestTo("/greet/details"))
//                .andRespond(withSuccess("hello", MediaType.TEXT_PLAIN));
//        String greeting = this.client.callRestService();
//        assertThat(greeting).isEqualTo("hello");
    }

}
