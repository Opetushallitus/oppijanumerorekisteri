export type Asiointikieli = 'fi' | 'sv' | 'en';
export type KutsunTila = 'AVOIN' | 'KAYTETTY' | 'POISTETTU';

type KayttooikeusRyhma = {
    id: number;
    nimi: { fi?: string; sv?: string; en?: string };
};

export type KutsuOrganisaatio = {
    nimi: { fi?: string; sv?: string; en?: string };
    organisaatioOid: string;
    voimassaLoppuPvm: string | null | undefined;
    kayttoOikeusRyhmat: KayttooikeusRyhma[];
};

export type KutsuRead = {
    id: number;
    tila: KutsunTila;
    etunimi: string;
    sukunimi: string;
    sahkoposti: string;
    aikaleima: string;
    asiointikieli: Asiointikieli;
    organisaatiot: KutsuOrganisaatio[];
    hakaIdentifier: string;
    saate?: string;
};

export type KutsuByToken = KutsuRead & { temporaryToken: string };
