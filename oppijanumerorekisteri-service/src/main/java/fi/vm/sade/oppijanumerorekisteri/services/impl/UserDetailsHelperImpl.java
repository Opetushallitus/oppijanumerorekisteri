package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.exceptions.UnauthorizedException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;

@Component
public class UserDetailsHelperImpl implements UserDetailsHelper {
    public final static String DEFAULT_KIELIKOODI = "fi";

    private static Optional<Authentication> getAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    @Override
    public Optional<String> findCurrentUserOid() {
        return getAuthentication().flatMap(authentication -> Optional.ofNullable(authentication.getName()));
    }

    @Override
    public String getCurrentUserOid() {
        return getAuthentication()
                .map(authentication -> Optional.ofNullable(authentication.getName())
                        .orElseThrow(UserHasNoOidException::new))
                .orElseThrow(() -> new UnauthorizedException("Käyttäjä ei ole kirjautunut"));
    }

    static public String getAsiointikieliOrDefault(Henkilo henkilo) {
        if (henkilo.getAsiointiKieli() != null && StringUtils.hasLength(henkilo.getAsiointiKieli().getKieliKoodi())) {
            return henkilo.getAsiointiKieli().getKieliKoodi();
        }
        else {
            return DEFAULT_KIELIKOODI.toLowerCase();
        }
    }

    /**
     * Palauttaa henkilön kutsumanimen. Jos kutsumanimi-kenttää ei ole asetettu yritetään käyttää etunimiä.
     * @param henkilo henkilö
     * @return henkilön kutsumanimi tai null jos ei löydy
     */
    static public String getKutsumanimiOrFirstEtunimi(Henkilo henkilo) {
        if (StringUtils.hasLength(henkilo.getKutsumanimi())) {
            return henkilo.getKutsumanimi();
        }
        if (StringUtils.hasLength(henkilo.getEtunimet())) {
            return Arrays.stream(henkilo.getEtunimet().split(" "))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

}
