const environments = ["hahtuva", "dev", "qa", "prod"] as const;
type EnvironmentName = (typeof environments)[number];

const defaultConfig = {
    virkailijaHost: "",
    minCapacity: 0,
    maxCapacity: 0,
    features: {
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": false,
        "oppijanumerorekisteri.tasks.datantuonti.import.enabled": false,
    },
};

export type Config = typeof defaultConfig;

export function getEnvironment(): EnvironmentName {
    const env = process.env.ENV;
    if (!env) {
        throw new Error("ENV environment variable is not set");
    }
    if (!contains(environments, env)) {
        throw new Error(`Invalid environment name: ${env}`);
    }
    return env as EnvironmentName;
}

function contains(arr: readonly string[], value: string): boolean {
    return arr.includes(value);
}

export function getConfig(): Config {
    const env = getEnvironment();
    return { hahtuva, dev, qa, prod }[env];
}

export const hahtuva: Config = {
    ...defaultConfig,
    virkailijaHost: "virkailija.hahtuvaopintopolku.fi",
    minCapacity: 1,
    maxCapacity: 2,
    features: {
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
        "oppijanumerorekisteri.tasks.datantuonti.import.enabled": true,
    },
};

export const dev: Config = {
    ...defaultConfig,
    virkailijaHost: "virkailija.untuvaopintopolku.fi",
    minCapacity: 1,
    maxCapacity: 2,
    features: {
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
        "oppijanumerorekisteri.tasks.datantuonti.import.enabled": true,
    },
};

export const qa: Config = {
    ...defaultConfig,
    virkailijaHost: "virkailija.testiopintopolku.fi",
    minCapacity: 1,
    maxCapacity: 2,
    features: {
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
        "oppijanumerorekisteri.tasks.datantuonti.import.enabled": true,
    },
};

export const prod: Config = {
    ...defaultConfig,
    virkailijaHost: "virkailija.opintopolku.fi",
    minCapacity: 2,
    maxCapacity: 8,
    features: {
        ...defaultConfig.features,
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
    }
};
