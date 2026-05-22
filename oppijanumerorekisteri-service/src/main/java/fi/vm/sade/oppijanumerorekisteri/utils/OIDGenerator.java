package fi.vm.sade.oppijanumerorekisteri.utils;

import java.util.Random;

/**
 *  OIDGenerator for generating OIDs for different node under the 1.2.246.562 root node.
 *
 *  Last digit is always a checksum. Two distinct checksum algorithms are used.
 *
 *  - "IBM 1 3 7" checksum algorithm for person oids (node 24). This is the same algorithm that's used in "viitenumero". See http://tarkistusmerkit.teppovuori.fi/tarkmerk.htm#viitenumero
 *  - "Luhn algorithm" for other oids. See http://tarkistusmerkit.teppovuori.fi/tarkmerk.htm#luhn, or https://en.wikipedia.org/wiki/Luhn_algorithm
 */
public class OIDGenerator {
    private static final String root = "1.2.246.562";

    public static final int HENKILO_OID_NODE = 24;
    static long min = 1000000000L;
    static long max = 10000000000L;
    private static Random r = new Random();

    public static String generateOID(int node) {
        long number = min + ((long) (r.nextDouble() * (max - min)));
        return makeOID(node, number);
    }

    public static String makeOID(final int node, final long number) {
        final int checkDigit = checksum(number, node);
        return root + "." + node + "." + number + checkDigit;
    }

    private static int checksum(final long number, final int node) {
        if (HENKILO_OID_NODE == node) {
            return ibmChecksum(number);
        } else {
            return luhnChecksum(number);
        }
    }

    static int ibmChecksum(long oid) {
        String oidStr = String.valueOf(oid);

        int sum = 0;
        int[] alternate = {7, 3 , 1};

        for (int i = oidStr.length() - 1, j = 0; i >= 0; i--, j++) {
            int n = Integer.parseInt(oidStr.substring(i, i + 1));

            sum += n * alternate[j % 3];
        }

        return (10 - sum % 10) % 10;
    }
    static int luhnChecksum(long oid) {
        String oidStr = String.valueOf(oid);

        int sum = 0;
        boolean alternate = true;

        for (int i = oidStr.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(oidStr.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }

        return (10 - sum % 10) % 10;
    }
}