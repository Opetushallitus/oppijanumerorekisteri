package fi.vm.sade.oppijanumerorekisteri.dto;

import com.sanctionco.jmail.EmailValidator;
import com.sanctionco.jmail.JMail;

import java.util.function.Function;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public enum YhteystietoTyyppi {
    YHTEYSTIETO_SAHKOPOSTI(ReadableYhteystiedot::getSahkoposti, WritableYhteystiedot::setSahkoposti),
    YHTEYSTIETO_PUHELINNUMERO(ReadableYhteystiedot::getPuhelinnumero, WritableYhteystiedot::setPuhelinnumero),
    YHTEYSTIETO_MATKAPUHELINNUMERO(ReadableYhteystiedot::getMatkapuhelinnumero, WritableYhteystiedot::setMatkapuhelinnumero),
    YHTEYSTIETO_KATUOSOITE(ReadableYhteystiedot::getKatuosoite, WritableYhteystiedot::setKatuosoite),
    YHTEYSTIETO_KUNTA(ReadableYhteystiedot::getKunta, WritableYhteystiedot::setKunta),
    YHTEYSTIETO_POSTINUMERO(ReadableYhteystiedot::getPostinumero, WritableYhteystiedot::setPostinumero),
    YHTEYSTIETO_KAUPUNKI(ReadableYhteystiedot::getKaupunki, WritableYhteystiedot::setKaupunki),
    YHTEYSTIETO_MAA(ReadableYhteystiedot::getMaa, WritableYhteystiedot::setMaa);

    static {
        EmailValidator emailValidator = JMail
                .strictValidator()
                .requireTopLevelDomain()
                .disallowExplicitSourceRouting()
                .disallowObsoleteWhitespace()
                .disallowQuotedIdentifiers();
        YHTEYSTIETO_SAHKOPOSTI.validator = emailValidator::isValid;

        Pattern postalCode = Pattern.compile("^\\d{5}$");
        YHTEYSTIETO_POSTINUMERO.validator = code -> postalCode.matcher(code).matches();

        Pattern phoneNumber = Pattern.compile("^(\\+[1-9]\\d{2,3}|\\d)([ ]?\\d{1,10}){1,10}$");
        YHTEYSTIETO_MATKAPUHELINNUMERO.validator = YHTEYSTIETO_PUHELINNUMERO.validator = number -> phoneNumber.matcher(number).matches();
    }

    private final Function<ReadableYhteystiedot, String> getter;
    private final Setter<WritableYhteystiedot, String> setter;
    private Predicate<String> validator = value -> true;

    YhteystietoTyyppi(Function<ReadableYhteystiedot, String> getter, Setter<WritableYhteystiedot, String> setter) {
        this.getter = getter;
        this.setter = setter;
    }

    public Function<ReadableYhteystiedot, String> getGetter() {
        return getter;
    }

    public Setter<WritableYhteystiedot, String> getSetter() {
        return setter;
    }

    public boolean validate(String value) {
        return value == null || value.isEmpty() || validator.test(value);
    }
}
