// @flow
const USERNAME_REGEXP = /^[_\-a-zA-Z0-9]{5,}$/

export function isValidKayttajatunnus(kayttajatunnus: string): boolean {
    return USERNAME_REGEXP.test(kayttajatunnus)
}
