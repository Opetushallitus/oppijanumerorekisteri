package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Välimuistituksen käyttöönotto. Katso konfiguraatio ehcache.xml.
 */
@Configuration
@EnableCaching
public class CacheConfiguration {

    public static final String CACHE_NAME_KOODISTOT = "koodistot";
    public static final String CACHE_NAME_OAUTH2_BEARER = "oauth2Bearer";

}
