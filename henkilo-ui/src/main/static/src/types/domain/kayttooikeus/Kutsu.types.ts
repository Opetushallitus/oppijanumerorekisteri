import { TextGroupMap } from './textgroup.types';

export type Asiointikieli = 'fi' | 'sv' | 'en';
export type KutsunTila = 'AVOIN' | 'KAYTETTY' | 'POISTETTU';

type KayttooikeusRyhma = {
    id: number;
    nimi: TextGroupMap;
};

export type KutsuOrganisaatio = {
    nimi: TextGroupMap;
    organisaatioOid: string;
    voimassaLoppuPvm: string | null | undefined;
    kayttoOikeusRyhmat: Array<KayttooikeusRyhma>;
};

export type KutsuRead = {
    id: number;
    tila: KutsunTila;
    etunimi: string;
    sukunimi: string;
    sahkoposti: string;
    aikaleima: string;
    asiointikieli: Asiointikieli;
    organisaatiot: Array<KutsuOrganisaatio>;
    hakaIdentifier: string;
    saate?: string;
};

export type KutsuByToken = KutsuRead & { temporaryToken: string };
