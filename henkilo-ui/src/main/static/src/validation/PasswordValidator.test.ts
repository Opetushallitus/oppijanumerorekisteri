import { isValidPassword, isValidPasswordLength } from './PasswordValidator';

describe('Tests for PasswordValidator', () => {
    describe('isValidPasswordLength', () => {
        it('should return whether given password is long enough', () => {
            expect(isValidPasswordLength('12345678901234567890')).toBeTruthy();
            expect(isValidPasswordLength('qwerasdfz')).toBeFalsy();
        });
    });

    describe('isValidPassword', () => {
        it('should return whether given password is valid', () => {
            expect(isValidPassword('akjBDJ543åÄ')).toBeFalsy();
            expect(isValidPassword('1234567890')).toBeFalsy();
            expect(isValidPassword('12345678901234567890')).toBeTruthy();
        });
    });
});
