package fi.vm.sade.oppijanumerorekisteri.services.vtj.kysely;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import lombok.RequiredArgsConstructor;
import org.apache.cxf.configuration.jsse.TLSClientParameters;
import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.apache.cxf.transport.http.HTTPConduit;
import org.apache.cxf.transports.http.configuration.HTTPClientPolicy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.tempuri.SoSoSoap;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import java.io.FileInputStream;
import java.security.KeyStore;

@Configuration
@RequiredArgsConstructor
public class VtjKyselyClientConfiguration {
    private final AuthenticationProperties authenticationProperties;

    @Bean
    public SoSoSoap vtjKyselyClient() throws Exception {
        var factoryBean = new JaxWsProxyFactoryBean();
        factoryBean.setServiceClass(SoSoSoap.class);
        factoryBean.setAddress(authenticationProperties.getVtjkysely().getAddress());
        var soapClient = (SoSoSoap) factoryBean.create();
        configureKeystore(soapClient);
        return soapClient;
    }

    private void configureKeystore(SoSoSoap c) throws Exception {
        var client = ClientProxy.getClient(c);
        var policy = new HTTPClientPolicy();
        policy.setVersion("1.1");
        var httpConduit = (HTTPConduit) client.getConduit();
        httpConduit.setClient(policy);

        var trustStore = loadKeyStore(authenticationProperties.getVtjkysely().getTruststore());
        var trustFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustFactory.init(trustStore);
        var trustManagers = trustFactory.getTrustManagers();

        var keyStore = loadKeyStore(authenticationProperties.getVtjkysely().getKeystore());
        var keyFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyFactory.init(keyStore, authenticationProperties.getVtjkysely().getKeystore().getPassword().toCharArray());
        var keyManagers = keyFactory.getKeyManagers();

        var tlsParams = new TLSClientParameters();
        tlsParams.setDisableCNCheck(true);
        tlsParams.setTrustManagers(trustManagers);
        tlsParams.setKeyManagers(keyManagers);
        tlsParams.setCertAlias(authenticationProperties.getVtjkysely().getCertAlias());

        httpConduit.setTlsClientParameters(tlsParams);
    }

    private KeyStore loadKeyStore(AuthenticationProperties.KeyStoreProperties properties) throws Exception {
        var keyStore = KeyStore.getInstance("JKS");
        keyStore.load(new FileInputStream(properties.getFile()), properties.getPassword().toCharArray());
        return keyStore;
    }
}
