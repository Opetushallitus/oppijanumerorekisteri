import { KayttooikeusOrganisaatiot } from './KayttooikeusPerustiedot.types';

export type Omattiedot = {
    isAdmin: boolean;
    isMiniAdmin: boolean;
    oidHenkilo: string;
    organisaatiot: Array<KayttooikeusOrganisaatiot>;
};
