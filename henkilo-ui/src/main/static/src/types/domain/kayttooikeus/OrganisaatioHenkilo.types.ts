import { AllowedKayttooikeus } from '../../../reducers/kayttooikeusryhma.reducer';
import { OrganisaatioWithChildren } from '../organisaatio/organisaatio.types';

export type OrganisaatioHenkilo = {
    organisaatio: OrganisaatioWithChildren;
};

export type KutsuOrganisaatio = {
    organisation: { oid: string; name: string; type: 'organisaatio' | 'ryhma' };
    voimassaLoppuPvm: string | null | undefined;
    selectedPermissions: AllowedKayttooikeus;
};
