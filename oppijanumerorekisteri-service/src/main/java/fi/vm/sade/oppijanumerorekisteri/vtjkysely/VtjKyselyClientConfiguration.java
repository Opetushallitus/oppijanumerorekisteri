package fi.vm.sade.oppijanumerorekisteri.vtjkysely;

import java.io.FileInputStream;
import java.net.Socket;
import java.security.KeyStore;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509KeyManager;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;
import org.springframework.ws.transport.http.HttpsUrlConnectionMessageSender;

@Configuration
public class VtjKyselyClientConfiguration {
    @Value("${oppijanumerorekisteri.vtjkysely.enabled}")
    private boolean vtjkyselyEnabled;
    @Value("${oppijanumerorekisteri.vtjkysely.address}")
    private String address;
    @Value("${oppijanumerorekisteri.vtjkysely.keystoreUri}")
    private String keyStore;
    @Value("${oppijanumerorekisteri.vtjkysely.keystorePassword}")
    private String keyStorePassword;
    @Value("${oppijanumerorekisteri.vtjkysely.certAlias}")
    private String certAlias;
    @Value("${oppijanumerorekisteri.vtjkysely.truststoreUri}")
    private String trustStore;
    @Value("${oppijanumerorekisteri.vtjkysely.truststorePassword}")
    private String trustStorePassword;

    @Bean
    Jaxb2Marshaller marshaller() {
        Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
        marshaller.setContextPath("fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb");
        return marshaller;
    }

    private KeyManager[] keyManagers() throws Exception {
        KeyStore ks = KeyStore.getInstance("JKS");
        ks.load(new FileInputStream(keyStore), keyStorePassword.toCharArray());
        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyManagerFactory.init(ks, keyStorePassword.toCharArray());

        final X509KeyManager origKm = (X509KeyManager) keyManagerFactory.getKeyManagers()[0];
        X509KeyManager customKeyManagerWithCorrectCertAlias = new X509KeyManager() {
            @Override
            public String chooseClientAlias(String[] keyType, Principal[] issuers, Socket socket) {
                return certAlias;
            }

            @Override
            public X509Certificate[] getCertificateChain(String alias) {
                return origKm.getCertificateChain(alias);
            }

            @Override
            public String[] getClientAliases(String keyType, Principal[] issuers) {
                return origKm.getClientAliases(keyType, issuers);
            }

            @Override
            public String[] getServerAliases(String keyType, Principal[] issuers) {
                return origKm.getServerAliases(keyType, issuers);
            }

            @Override
            public String chooseServerAlias(String keyType, Principal[] issuers, Socket socket) {
                return chooseServerAlias(keyType, issuers, socket);
            }

            @Override
            public PrivateKey getPrivateKey(String alias) {
                return getPrivateKey(alias);
            }
        };

        return new KeyManager[] { customKeyManagerWithCorrectCertAlias };
    }

    private TrustManager[] trustManagers() throws Exception {
        KeyStore ts = KeyStore.getInstance("JKS");
        ts.load(new FileInputStream(trustStore), keyStorePassword.toCharArray());
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(ts);

        return trustManagerFactory.getTrustManagers();
    }

    private HttpsUrlConnectionMessageSender messageSender() throws Exception {
        HttpsUrlConnectionMessageSender messageSender = new HttpsUrlConnectionMessageSender();
        messageSender.setKeyManagers(keyManagers());
        messageSender.setTrustManagers(trustManagers());
        return messageSender;
    }

    @Bean
    VtjKyselyClient vtjClient(Jaxb2Marshaller marshaller) throws Exception {
        VtjKyselyClient client = new VtjKyselyClient();
        client.setDefaultUri(address);
        if (vtjkyselyEnabled) {
            client.setMessageSender(messageSender());
        }
        client.setMarshaller(marshaller);
        client.setUnmarshaller(marshaller);
        return client;
    }
}