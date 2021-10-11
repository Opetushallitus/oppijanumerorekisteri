import { parseEmailOptions } from './henkilo.util';
import { WORK_ADDRESS, EMAIL } from '../types/constants';
import { YhteystietoRyhma } from '../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';

describe('henkilo.util', () => {
    describe('parseEmailOptions', () => {
        const email = 'test@test.test';

        const contactInfoGroupTemplate = {
            ryhmaKuvaus: WORK_ADDRESS,
            yhteystieto: [],
        };

        const contctInfoTemplate = [
            {
                yhteystietoTyyppi: EMAIL,
                yhteystietoArvo: email,
            },
        ];

        const foundEmail = [{ label: email, value: email }];

        test.each([
            ['Handles invalid parameters', undefined, []],
            ['Handles empty contact info groups', [], []],
            ['Handles empty contact info', [{ ...contactInfoGroupTemplate }], []],
            [
                'Finds work address',
                [{ ...contactInfoGroupTemplate, yhteystieto: [...contctInfoTemplate] }],
                [...foundEmail],
            ],
            [
                'Discard wrong address types',
                [
                    {
                        ...contactInfoGroupTemplate,
                        yhteystieto: [{ yhteystietoTyyppi: 'TEST', yhteystietoArvo: email }],
                    },
                ],
                [],
            ],
            [
                'Discard empty email addresses',
                [{ ...contactInfoGroupTemplate, yhteystieto: [{ yhteystietoTyyppi: EMAIL, yhteystietoArvo: null }] }],
                [],
            ],
            [
                'Returns addresses in sorted orderd',
                [
                    { ...contactInfoGroupTemplate, yhteystieto: [{ yhteystietoTyyppi: EMAIL, yhteystietoArvo: 'b' }] },
                    { ...contactInfoGroupTemplate, yhteystieto: [{ yhteystietoTyyppi: EMAIL, yhteystietoArvo: 'a' }] },
                ],
                [
                    { label: 'a', value: 'a' },
                    { label: 'b', value: 'b' },
                ],
            ],
            ['Discards wrong address group types', [{ ryhmaKuvaus: 'test', yhteystieto: [...contctInfoTemplate] }], []],
        ])('%s', (_, args, expected) => expect(parseEmailOptions(args as YhteystietoRyhma[])).toEqual(expected));
    });
});
