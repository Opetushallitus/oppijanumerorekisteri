const kutsuTypes = {
    ONLY_OWN_KUTSUS: 'ONLY_OWN_KUTSUS',
    ADMIN: 'ADMIN',
    OPH: 'OPH',
    KAYTTOOIKEUSRYHMA: 'KAYTTOOIKEUSRYHMA',
    DEFAULT: '',
} as const;

export type KutsuTypes = keyof typeof kutsuTypes;
export type KutsuView = (typeof kutsuTypes)[KutsuTypes];

export default kutsuTypes;
