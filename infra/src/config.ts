const environments = ["hahtuva", "dev", "qa", "prod"] as const;
type EnvironmentName = (typeof environments)[number];

export type AutoScalingLimits = {
  min: number;
  max: number;
};
export type Config = {
  oauthDomainName: string;
  virkailijaHost: string;
  apiCapacity: AutoScalingLimits;
  batchCapacity: AutoScalingLimits;
  features: {
    vtj: boolean;
    "oppijanumerorekisteri.tasks.datantuonti.export.enabled": boolean;
    "oppijanumerorekisteri.tasks.datantuonti.import.enabled": boolean;
    "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled": boolean;
  };
  lampiExport?: {
    enabled: boolean;
    bucketName: string;
  };
};

const defaultConfig = {
  apiCapacity: { min: 2, max: 8 },
  batchCapacity: { min: 1, max: 1 },
  features: {
    vtj: true,
    "oppijanumerorekisteri.tasks.datantuonti.export.enabled": false,
    "oppijanumerorekisteri.tasks.datantuonti.import.enabled": false,
    "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled": false,
  },
};

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
  oauthDomainName: "hahtuva.oppijanumerorekisteri.opintopolku.fi",
  virkailijaHost: "virkailija.hahtuvaopintopolku.fi",
  apiCapacity: { min: 1, max: 2 },
  features: {
    vtj: false,
    "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
    "oppijanumerorekisteri.tasks.datantuonti.import.enabled": true,
    "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled": true,
  },
};

export const dev: Config = {
  ...defaultConfig,
  oauthDomainName: "dev.oppijanumerorekisteri.opintopolku.fi",
  virkailijaHost: "virkailija.untuvaopintopolku.fi",
  apiCapacity: { min: 1, max: 2 },
  features: {
    vtj: false,
    "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
    "oppijanumerorekisteri.tasks.datantuonti.import.enabled": true,
    "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled": true,
  },
  lampiExport: {
    enabled: true,
    bucketName: "oph-lampi-dev",
  },
};

export const qa: Config = {
  ...defaultConfig,
  oauthDomainName: "qa.oppijanumerorekisteri.opintopolku.fi",
  virkailijaHost: "virkailija.testiopintopolku.fi",
  apiCapacity: { min: 1, max: 2 },
  features: {
    vtj: false,
    "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
    "oppijanumerorekisteri.tasks.datantuonti.import.enabled": true,
    "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled": true,
  },
  lampiExport: {
    enabled: true,
    bucketName: "oph-lampi-qa",
  },
};

export const prod: Config = {
  ...defaultConfig,
  oauthDomainName: "prod.oppijanumerorekisteri.opintopolku.fi",
  virkailijaHost: "virkailija.opintopolku.fi",
  apiCapacity: { min: 2, max: 8 },
  features: {
    ...defaultConfig.features,
    "oppijanumerorekisteri.tasks.datantuonti.export.enabled": true,
  },
  lampiExport: {
    enabled: true,
    bucketName: "oph-lampi-prod",
  },
};
