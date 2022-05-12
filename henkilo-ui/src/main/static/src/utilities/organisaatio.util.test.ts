import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from './organisaatio.util';
import type { OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';

describe('omattiedotOrganisaatiotToOrganisaatioSelectObject', () => {
    const parent: OrganisaatioWithChildren = {
        oid: '2',
        parentOid: '1',
        parentOidPath: '1',
        nimi: {
            fi: 'b',
        },
        status: 'AKTIIVINEN',
        tyypit: [],
        parent: null,
        children: [],
    };

    const child: OrganisaatioWithChildren = {
        oid: '3',
        parentOid: '2',
        parentOidPath: '1/2',
        nimi: {
            fi: 'c',
        },
        status: 'AKTIIVINEN',
        tyypit: [],
        parent: null,
        children: [],
    };

    parent.children = [child];
    child.parent = parent;

    test('handles empty input', () => {
        expect(omattiedotOrganisaatiotToOrganisaatioSelectObject([], 'fi')).toMatchObject([]);
    });

    test('resolve organisation hierarchy correctly', () => {
        expect(omattiedotOrganisaatiotToOrganisaatioSelectObject([{ organisaatio: parent }], 'fi')).toMatchSnapshot();
    });
});
