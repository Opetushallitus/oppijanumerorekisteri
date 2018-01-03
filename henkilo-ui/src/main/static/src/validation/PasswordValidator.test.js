// @flow

import {
    containsLowercaseLetters, containsNumber, containsSpecialCharacter, containsUppercaseLetters, isValidPassword,
    isValidPasswordLength
} from "./PasswordValidator";

describe('Tests for PasswordValidator', () => {

    describe('isValidPasswordLength', () => {
        it('should return whether given password is long enough', () => {
            expect(isValidPasswordLength('1234567890')).toBeTruthy();
            expect(isValidPasswordLength('qwerasdfz')).toBeFalsy();
        });
    });

    describe('containsNumber', () => {
        it('should return whether given password contains at least one number', () => {
            expect(containsNumber('ksei8sl94')).toBeTruthy();
            expect(containsNumber('klödfjglkdoir')).toBeFalsy();
        });
    });

    describe('containLowercaseLetters', () => {
        it('should return whether given password contains at least one lowercase letter', () => {
            expect(containsLowercaseLetters('FI€&)NNXFG')).toBeFalsy();
            expect(containsLowercaseLetters('IUSERTIOUh')).toBeTruthy();
        });
    });

    describe('containsUppercaseLetters', () => {
        it('should return whether given password contains at least one uppercase letter', () => {
            expect(containsUppercaseLetters('lksjd50i9jd')).toBeFalsy();
            expect(containsUppercaseLetters('kjsdlfjFG')).toBeTruthy();
        });

        it('should return true if there is a nordic alphabet', () => {
            expect(containsUppercaseLetters('sdfasdSDFÄ')).toBeTruthy();
        });
    });

    describe('containsSpecialCharacter', () => {
        it('should return whether given password contains at least one special character', () => {
            expect(containsSpecialCharacter('lkjdfksjfTYIPSR6iout')).toBeFalsy();
            expect(containsSpecialCharacter('lökjssKJGKFL/(')).toBeTruthy();
        });
    });

    describe('isValidPassword', () => {
        it('should return whether given password is valid', () => {
            expect(isValidPassword('akjBDJ543åÄ')).toBeFalsy();
            expect(isValidPassword('1234567890')).toBeFalsy();
            expect(isValidPassword('adjSdklji8/&%')).toBeTruthy();
        });


    });

});