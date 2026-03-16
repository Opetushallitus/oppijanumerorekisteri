package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.Random;

public class OidGenerator {
  public static final String OPH_ROOT_OID = "1.2.246.562";
  public static final int OID_NODE_PROD_HENKILO = 24;
  public static final int OID_NODE_PROD_OPISKELUOIKEUS = 15;
  static long min = 1000000000L;
  static long max = 10000000000L;
  private static Random r = new Random();

  public static String generateHenkiloOid() {
    return generateOID(OID_NODE_PROD_HENKILO);
  }

  public static String generateOpiskeluoikeusOid() {
    return generateOID(OID_NODE_PROD_OPISKELUOIKEUS);
  }

  private static String generateOID(int node) {
    long number = min + (long) (r.nextDouble() * (double) (max - min));
    return makeOID(node, number);
  }

  public static String makeOID(int node, long number) {
    int checkDigit = checksum(number, node);
    return OPH_ROOT_OID + node + "." + number + checkDigit;
  }

  private static int checksum(long number, int node) {
    return 24 == node ? ibmChecksum(number) : luhnChecksum(number);
  }

  static int ibmChecksum(long oid) {
    String oidStr = String.valueOf(oid);
    int sum = 0;
    int[] alternate = new int[] {7, 3, 1};
    int i = oidStr.length() - 1;

    for (int j = 0; i >= 0; ++j) {
      int n = Integer.parseInt(oidStr.substring(i, i + 1));
      sum += n * alternate[j % 3];
      --i;
    }

    return (10 - sum % 10) % 10;
  }

  static int luhnChecksum(long oid) {
    String oidStr = String.valueOf(oid);
    int sum = 0;
    boolean alternate = true;

    for (int i = oidStr.length() - 1; i >= 0; --i) {
      int n = Integer.parseInt(oidStr.substring(i, i + 1));
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = n % 10 + 1;
        }
      }

      sum += n;
      alternate = !alternate;
    }

    return (10 - sum % 10) % 10;
  }
}
