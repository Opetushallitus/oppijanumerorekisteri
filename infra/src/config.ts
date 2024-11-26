const environments = ["hahtuva", "dev", "qa", "prod"] as const;
type EnvironmentName = (typeof environments)[number];

const defaultConfig = {
    alarmTopicArn: "",
    virkailijaHost: "",
    minCapacity: 0,
    maxCapacity: 0,
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
    alarmTopicArn: "arn:aws:sns:eu-west-1:471112979851:alarm",
    virkailijaHost: "virkailija.hahtuvaopintopolku.fi",
    minCapacity: 1,
    maxCapacity: 2,
};

export const dev: Config = {
    ...defaultConfig,
    alarmTopicArn: "arn:aws:sns:eu-west-1:058264235340:alarm",
    virkailijaHost: "virkailija.untuvaopintopolku.fi",
    minCapacity: 1,
    maxCapacity: 2,
};

export const qa: Config = {
    ...defaultConfig,
    alarmTopicArn: "arn:aws:sns:eu-west-1:730335317715:alarm",
    virkailijaHost: "virkailija.testiopintopolku.fi",
    minCapacity: 1,
    maxCapacity: 2,
};

export const prod: Config = {
    ...defaultConfig,
    alarmTopicArn: "arn:aws:sns:eu-west-1:767397734142:alarm",
    virkailijaHost: "virkailija.opintopolku.fi",
    minCapacity: 2,
    maxCapacity: 8,
};
