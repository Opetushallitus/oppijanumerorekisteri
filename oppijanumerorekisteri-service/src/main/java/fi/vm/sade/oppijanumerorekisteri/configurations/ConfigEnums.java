package fi.vm.sade.oppijanumerorekisteri.configurations;

public enum  ConfigEnums {
    SUBSYSTEMCODE("oppijanumerorekisteri-service");

    private final String value;

    ConfigEnums(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static ConfigEnums fromValue(String v) {
        for (ConfigEnums c: ConfigEnums.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }
}
