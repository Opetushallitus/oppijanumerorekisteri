import { OrganisaatioWithChildren } from '../organisaatio/organisaatio.types';
import { MyonnettyKayttooikeusryhma } from './kayttooikeusryhma.types';

export type OrganisaatioHenkilo = {
    organisaatio: OrganisaatioWithChildren;
};

export type KutsuOrganisaatio = {
    id: number;
    organisation: { oid: string; name: string; type: 'organisaatio' | 'ryhma' };
    voimassaLoppuPvm: string | null | undefined;
    selectedPermissions: MyonnettyKayttooikeusryhma[];
};
