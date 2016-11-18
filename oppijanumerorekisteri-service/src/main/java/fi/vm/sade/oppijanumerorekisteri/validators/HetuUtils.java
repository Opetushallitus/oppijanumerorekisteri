package fi.vm.sade.oppijanumerorekisteri.validators;

import java.text.SimpleDateFormat;

public class HetuUtils {
    private static final char[] tarkistusmerkit = {'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','H','J','K','L','M','N','P','R','S','T','U','V','W','X','Y'};

    public static boolean hetuIsValid(String hetu) {
        boolean valid = false;
        if (hetu != null && hetu.length() == 11) {
            try {
                int year = Integer.parseInt(hetu.substring(4, 6), 10);
                char erotin = hetu.charAt(6);
                switch (erotin) {
                    case '-':
                        year += 1900;
                        break;
                    case 'A':
                        year += 2000;
                        break;
                    case '+':
                        year += 1800;
                        break;
                    default:
                        return false;
                }
                SimpleDateFormat sdf = new SimpleDateFormat("ddMMyyyy");
                sdf.setLenient(false);
                sdf.parse(hetu.substring(0, 4) + year);

                int luku = Integer.parseInt(hetu.substring(0, 6) + hetu.substring(7, 10), 10);
                valid = hetu.charAt(10) == tarkistusmerkit[luku % 31];

            }
            catch (Exception e) {
                return false;
            }
        }
        return valid;
    }

}
