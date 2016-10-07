package fi.vm.sade.oppijanumerorekisteri.utils;

import org.springframework.security.core.context.SecurityContextHolder;

public class UserDetailsUtil {
    /**
     * Fetches user oid from SecurityContext
     *
     * @return oid of currently authenticated user
     * @throws NullPointerException
     *             if user oid is not available from security context
     */
    public static String getCurrentUserOid() throws NullPointerException {
        String oid = SecurityContextHolder.getContext().getAuthentication().getName();
        if (oid == null) {
            throw new NullPointerException("No user name available from SecurityContext!");
        }

        return oid;
    }
}
