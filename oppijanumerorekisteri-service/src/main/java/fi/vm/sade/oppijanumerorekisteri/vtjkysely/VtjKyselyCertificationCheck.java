package fi.vm.sade.oppijanumerorekisteri.vtjkysely;

import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.Enumeration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class VtjKyselyCertificationCheck {
    @Value("${oppijanumerorekisteri.vtjkysely.keystoreUri}")
    private String keyStore;
    @Value("${oppijanumerorekisteri.vtjkysely.keystorePassword}")
    private String keyStorePassword;
    @Value("${oppijanumerorekisteri.vtjkysely.certAlias}")
    private String certAlias;

    public void checkCertificationValidity() {
        try {
            KeyStore ks = KeyStore.getInstance("JKS");
            ks.load(new FileInputStream(keyStore), keyStorePassword.toCharArray());
            Date aMonthFromNow = Date.from(LocalDateTime.now().plusDays(30).toInstant(ZoneOffset.UTC));

            Enumeration<String> enumeration = ks.aliases();
            while(enumeration.hasMoreElements()) {
                String alias = enumeration.nextElement();
                var certificate = (X509Certificate) ks.getCertificate(alias);
                if (certAlias.equals(alias) && certificate.getNotAfter().after(aMonthFromNow)) {
                    log.info("VTJKysely certification is valid at least 30 days.");
                } else if (certAlias.equals(alias)) {
                    log.warn("VTJKysely certification is expiring in less than 30 days.");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
