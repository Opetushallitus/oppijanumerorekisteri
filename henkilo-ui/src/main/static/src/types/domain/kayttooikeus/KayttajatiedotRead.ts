export type KayttajatiedotRead = {
    username: string;
    mfaProvider: string | null;
    kayttajaTyyppi: 'PALVELU' | 'VIRKAILIJA';
    etunimet: string;
    sukunimi: string;
};
