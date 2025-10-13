const minimunPasswordLength = 20;
const forbidden = /[^a-zA-Z0-9!#$%*_+=?]/;
const specialCharacterRegex = /[!#$%*_+=?]/;
const numberRegex = /\d/;
const lowercaseLetters = /[a-z]/;
const uppercaseLetters = /[A-Z]/;

export const isValidPasswordLength = (password: string) => password.length >= minimunPasswordLength;
export const hasForbiddenCharacters = (password: string) => forbidden.exec(password) !== null;
export const containsNumber = (password: string) => numberRegex.exec(password) !== null;
export const containsLowercaseLetters = (password: string) => lowercaseLetters.exec(password) !== null;
export const containsUppercaseLetters = (password: string) => uppercaseLetters.exec(password) !== null;
export const containsSpecialCharacter = (password: string) => specialCharacterRegex.exec(password) !== null;
const atLeast = (password: string, n: number, fn: ((s: string) => boolean)[]): boolean =>
    fn.map((f) => f(password)).filter(Boolean).length >= n;

export const isValidPassword = (password: string): boolean => {
    if (typeof password !== 'string') {
        return false;
    }

    return (
        isValidPasswordLength(password) &&
        !hasForbiddenCharacters(password) &&
        atLeast(password, 3, [
            containsNumber,
            containsLowercaseLetters,
            containsUppercaseLetters,
            containsSpecialCharacter,
        ])
    );
};
