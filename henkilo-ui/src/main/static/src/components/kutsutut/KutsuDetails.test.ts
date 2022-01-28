import { resolveInvitationRights } from './KutsuDetails';
import type { KutsuRead as Kutsu } from '../../types/domain/kayttooikeus/Kutsu.types';

jest.mock('../../localizabletext', () => ({
    toLocalizedText: (locale, key) => key,
}));

describe('KutsuDetails', () => {
    describe('resolveInvitationRights', () => {
        const kutsu = {
            organisaatiot: [],
        };

        const organisaatio = {
            nimi: 'test-org',
            kayttoOikeusRyhmat: [],
        };

        const kayttooikeusryhma = {
            nimi: 'test-group',
        };

        const result = {
            organisaatio: 'test-org',
            ryhma: 'test-group',
        };

        const testcase = [
            ['Survives undefined invitation (irrelevant)', undefined, []],
            ['Handles empty invitation (irrelevant)', { ...kutsu }, []],
            ['Handles org without rights (irrelevant)', { ...kutsu, organisaatiot: [{ ...organisaatio }] }, []],
            [
                'Org with right (normal case)',
                {
                    ...kutsu,
                    organisaatiot: [
                        {
                            ...organisaatio,
                            kayttoOikeusRyhmat: [{ ...kayttooikeusryhma }],
                        },
                    ],
                },
                [{ ...result }],
            ],
            [
                'Org with multiple rights',
                {
                    ...kutsu,
                    organisaatiot: [
                        {
                            ...organisaatio,
                            kayttoOikeusRyhmat: [{ ...kayttooikeusryhma }, { ...kayttooikeusryhma }],
                        },
                    ],
                },
                [{ ...result }, { ...result }],
            ],
            [
                'Multiple organisations with rights',
                {
                    ...kutsu,
                    organisaatiot: [
                        {
                            ...organisaatio,
                            kayttoOikeusRyhmat: [{ ...kayttooikeusryhma }],
                        },
                        {
                            ...organisaatio,
                            kayttoOikeusRyhmat: [{ ...kayttooikeusryhma }],
                        },
                    ],
                },
                [{ ...result }, { ...result }],
            ],
        ];

        // @ts-ignore
        it.each(testcase)('%s', (_, fixture, expected) => {
            expect(resolveInvitationRights(fixture as Kutsu, 'test')).toEqual(expected);
        });
    });
});
