import type { Option } from 'react-select';

export type OrganisaatioSelectObject = {
    oid: string;
    name: string;
    parentNames: Array<string>;
    organisaatiotyypit: Array<string>;
    oidPath: string;
    status: string;
};

export type RyhmaSelectObject = Option<string>;

export function isOrganisaatioSelection(
    selection: OrganisaatioSelectObject | RyhmaSelectObject
): selection is OrganisaatioSelectObject {
    return (selection as OrganisaatioSelectObject).oid !== undefined;
}
