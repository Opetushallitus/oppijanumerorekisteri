import { schema } from './CreateWithSSN';

describe('CreateWithSSN', () => {
    describe('Verify form validation schema', () => {
        const valid = {
            ssn: '000000-0000',
            firstName: 'X Æ A-12',
            nickName: 'Æ',
            lastName: 'Musk',
        };

        test.each([
            ['Accepts valid input', valid, true],
            ['Rejects empty ssn', { ...valid, ssn: '' }, false],
            ['Rejects empty name', { ...valid, firstName: '' }, false],
            ['Rejects empty nick', { ...valid, nickName: '' }, false],
            ['Rejects empty last', { ...valid, lastName: '' }, false],
            ['Rejects incorrect ssn', { ...valid, ssn: 'test' }, false],
            ['Rejects incorrect nick', { ...valid, nickName: 'test' }, false],
            ['Rejects multiple nicks', { ...valid, nickName: 'X Æ A-12' }, true],
            ['Accepts multiple lastNames', { ...valid, lastName: 'X Æ A-12' }, true],
        ])('%s', (_, input, expected) => {
            expect(!!!schema.validate(input).error).toEqual(expected);
        });
    });
});
