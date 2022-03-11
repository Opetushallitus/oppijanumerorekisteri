import { validateYhteystiedotRyhmaEmails } from './yhteystietoryhma.util';

describe('ytheystietoryhma.util', () => {
    describe('validateYhteystiedotRyhmaEmails', () => {
        const yhteystiedotRyhma = (email: string) => ({
            yhteystieto: [
                {
                    yhteystietoTyyppi: 'YHTEYSTIETO_SAHKOPOSTI',
                    yhteystietoArvo: email,
                },
            ],
        });

        test.each([
            ['is undefined', undefined, false],
            ['is empty array', [], false],
            ['contains undefined email', [yhteystiedotRyhma(undefined)], false],
            ['contains empty email', [yhteystiedotRyhma('')], false],
            ['is invalid email', [yhteystiedotRyhma('blerh')], false],
            ['is valid email', [yhteystiedotRyhma('a@a.a')], true],
            ['contains invalid email', [yhteystiedotRyhma('a@a.a'), yhteystiedotRyhma('blerh')], false],
            ['has multiple valid emails', [yhteystiedotRyhma('a@a.a'), yhteystiedotRyhma('a@a.a')], true],
        ])('validates correctly when input %s', (_, input, expected) => {
            // @ts-ignore
            expect(validateYhteystiedotRyhmaEmails(input)).toEqual(expected);
        });
    });
});
