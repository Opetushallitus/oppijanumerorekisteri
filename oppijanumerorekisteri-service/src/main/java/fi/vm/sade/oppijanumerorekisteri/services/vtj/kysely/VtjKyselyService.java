package fi.vm.sade.oppijanumerorekisteri.services.vtj.kysely;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vrk.xml.schema.vtjkysely.VTJHenkiloVastaussanoma;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.cxf.configuration.jsse.TLSClientParameters;
import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.apache.cxf.transport.http.HTTPConduit;
import org.apache.cxf.transports.http.configuration.HTTPClientPolicy;
import org.springframework.boot.availability.ApplicationAvailabilityBean;
import org.springframework.stereotype.Service;
import org.tempuri.SoSoSoap;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import java.io.FileInputStream;
import java.security.KeyStore;

@Service
@Slf4j
@RequiredArgsConstructor
public class VtjKyselyService {
    private final SoSoSoap vtjKyselyClient;
    private final AuthenticationProperties authenticationProperties;

    public VTJHenkiloVastaussanoma teeHenkilonTunnusKysely(String loppukayttaja, String hetu) {
        var username = authenticationProperties.getVtjkysely().getUsername();
        var password = authenticationProperties.getVtjkysely().getPassword();

        var tunnusKyselyResult = vtjKyselyClient.teeHenkilonTunnusKysely("OPHREK", username, password, loppukayttaja, null, hetu, null, null, null, null, null, null, null);
        return (VTJHenkiloVastaussanoma) tunnusKyselyResult.getContent().get(0);
    }

}
