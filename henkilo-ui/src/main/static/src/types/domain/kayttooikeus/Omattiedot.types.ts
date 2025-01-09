import { KayttooikeusOrganisaatiot } from './KayttooikeusPerustiedot.types';

export type Omattiedot = {
    isAdmin: boolean;
    isMiniAdmin: boolean;
    mfaProvider?: string | null;
    idpEntityId?: string;
    oidHenkilo: string;
    organisaatiot: Array<KayttooikeusOrganisaatiot>;
};
