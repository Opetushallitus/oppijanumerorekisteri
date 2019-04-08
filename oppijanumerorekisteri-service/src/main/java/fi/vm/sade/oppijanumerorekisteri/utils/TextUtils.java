package fi.vm.sade.oppijanumerorekisteri.utils;

import net.gcardone.junidecode.Junidecode;

import java.text.Normalizer;

public class TextUtils {

    public static String normalize(String string){
        String result = Normalizer.normalize(string, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        return Junidecode.unidecode(org.apache.commons.lang3.StringUtils.stripAccents(result));
    }
}
