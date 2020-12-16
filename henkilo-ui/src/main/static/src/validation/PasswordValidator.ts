export const specialCharacterRegex = /[!@#$%^&*()~`\-=_+[\]{}|:";',.\\/<>?]/;
export const numberRegex = /\d/;
export const lowercaseLetters = /[a-zäöå]/;
export const uppercaseLetters = /[A-ZÄÖÅ]/;
export const minimunPasswordLength = 10;

export const isValidPasswordLength = (password: string) => password.length >= minimunPasswordLength;
export const containsNumber = (password: string) => numberRegex.exec(password) !== null;
export const containsLowercaseLetters = (password: string) => lowercaseLetters.exec(password) !== null;
export const containsUppercaseLetters = (password: string) => uppercaseLetters.exec(password) !== null;
export const containsSpecialCharacter = (password: string) => specialCharacterRegex.exec(password) !== null;

export const isValidPassword = (password: string): boolean => {
    if (typeof password !== 'string') {
        return false;
    }

    return (
        isValidPasswordLength(password) &&
        containsNumber(password) &&
        containsLowercaseLetters(password) &&
        containsUppercaseLetters(password) &&
        containsSpecialCharacter(password)
    );
};
