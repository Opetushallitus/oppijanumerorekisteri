import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from './organisaatio.util';
import type { OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';
import type { OrganisaatioNameLookup } from '../reducers/organisaatio.reducer';

describe('omattiedotOrganisaatiotToOrganisaatioSelectObject', () => {
    const parent: OrganisaatioWithChildren = {
        oid: '3',
        parentOid: '2',
        parentOidPath: '1/2',
        nimi: {
            fi: '',
        },
        status: 'AKTIIVINEN',
        tyypit: [],
        parent: null,
        children: [],
    };

    const child: OrganisaatioWithChildren = {
        oid: '4',
        parentOid: '3',
        parentOidPath: '1/2/3',
        nimi: {
            fi: '',
        },
        status: 'AKTIIVINEN',
        tyypit: [],
        parent: null,
        children: [],
    };

    parent.children = [child];
    child.parent = parent;

    const parentNames: OrganisaatioNameLookup = {
        1: { fi: 'root', sv: 'root', en: 'root' },
        2: { fi: 'a', sv: 'a', en: 'a' },
        3: { fi: 'b', sv: 'b', en: 'b' },
        4: { fi: 'c', sv: 'c', en: 'c' },
    };

    test('handles empty input', () => {
        expect(omattiedotOrganisaatiotToOrganisaatioSelectObject([], {}, 'fi')).toMatchObject([]);
    });

    test('resolve organisation hierarchy correctly', () => {
        expect(
            omattiedotOrganisaatiotToOrganisaatioSelectObject([{ organisaatio: parent }], parentNames, 'fi')
        ).toMatchSnapshot();
    });

    test('oid as name if name is missing', () => {
        expect(
            omattiedotOrganisaatiotToOrganisaatioSelectObject([{ organisaatio: parent }], {}, 'fi')
        ).toMatchSnapshot();
    });
});
