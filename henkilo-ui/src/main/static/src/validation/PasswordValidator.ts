export const minimunPasswordLength = 20;

export const isValidPasswordLength = (password: string) => password.length >= minimunPasswordLength;

export const isValidPassword = (password: string): boolean => {
    if (typeof password !== 'string') {
        return false;
    }

    return isValidPasswordLength(password);
};
