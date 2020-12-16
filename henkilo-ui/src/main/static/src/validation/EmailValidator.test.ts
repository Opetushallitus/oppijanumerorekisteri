import { validateEmail } from './EmailValidator';

describe('Tests for EmailValidator', () => {
    describe('contains alphabets', () => {
        it('should return true for a basic address', () => {
            expect(validateEmail('testi.henkilo@domain.com')).toBeTruthy();
            expect(validateEmail('ääkkösiä@oph.fi')).toBeTruthy();
        });
    });

    describe('contains number', () => {
        it('should return true for email adress containing numbers', () => {
            expect(validateEmail('1234@test.com')).toBeTruthy();
            expect(validateEmail('123@123.com')).toBeTruthy();
        });
    });

    describe('incorrect domain name', () => {
        it('should fail if there is just one part in domain', () => {
            expect(validateEmail('abc@def')).toBeFalsy();
        });
    });

    describe('missing domain', () => {
        it('should fail if domain is missing', () => {
            expect(validateEmail('testaaja')).toBeFalsy();
            expect(validateEmail('testaaja@')).toBeFalsy();
        });
    });

    describe('contains special characters', () => {
        it('should return true if email contains special characters', () => {
            expect(validateEmail('kjsd?.s@domain.com')).toBeTruthy();
            expect(validateEmail('kld8€%/%&@ksdjfkc.om')).toBeTruthy();
        });
    });
});
