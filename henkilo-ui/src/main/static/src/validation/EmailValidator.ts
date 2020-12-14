// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
export function validateEmail(email: string): boolean {
    const emailRegexp = /\S+@\S+\.\S+/
    return emailRegexp.test(String(email).toLowerCase())
}