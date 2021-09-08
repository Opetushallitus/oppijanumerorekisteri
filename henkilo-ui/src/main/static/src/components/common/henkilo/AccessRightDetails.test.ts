import { resolveLocalizedText } from './AccessRightDetails';

describe('AccessRightDetails', () => {
    describe('resolveLocalizedText', () => {
        test.each([
            ['Handles invalid parameters', undefined, undefined, ''],
            ['Handles empty text groups', [], 'fi', ''],
            ['Resolves text correctly', [{ text: 'testi', lang: 'FI' }], 'FI', 'testi'],
            ['Case insensitive lang parameter', [{ text: 'testi', lang: 'FI' }], 'fi', 'testi'],
            ['Case insensitive lang data', [{ text: 'testi', lang: 'fi' }], 'FI', 'testi'],
            ['Defaults to finnish', [{ text: 'testi', lang: 'FI' }], undefined, 'testi'],
            [
                'Filters wrong translations',
                [
                    { text: 'test', lang: 'EN' },
                    { text: 'testi', lang: 'FI' },
                ],
                'fi',
                'testi',
            ],
            [
                'Pick first matching translation',
                [
                    { text: 'testi', lang: 'FI' },
                    { text: 'Roska', lang: 'FI' },
                ],
                'fi',
                'testi',
            ],
        ])('%s', (_, textGroup, lang, expected) => expect(resolveLocalizedText(textGroup, lang)).toEqual(expected));
    });
});
