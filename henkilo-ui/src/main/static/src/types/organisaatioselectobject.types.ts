import { SelectOption } from '../utilities/select';

export type OrganisaatioSelectObject = {
    oid: string;
    name: string;
    parentNames: Array<string>;
    organisaatiotyypit: Array<string>;
    oidPath?: string;
    status?: string;
};

type RyhmaSelectObject = SelectOption;

export function isOrganisaatioSelection(
    selection: OrganisaatioSelectObject | RyhmaSelectObject
): selection is OrganisaatioSelectObject {
    return (selection as OrganisaatioSelectObject).oid !== undefined;
}
