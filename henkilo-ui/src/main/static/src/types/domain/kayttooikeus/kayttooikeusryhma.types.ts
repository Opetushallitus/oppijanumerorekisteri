import { TextGroup } from './textgroup.types';
import { PalveluRooliModify } from './PalveluRooliModify.types';
import { OrganisaatioViite } from './organisaatioviite.types';
import { SallitutKayttajatyypit } from '../../../components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import { KayttooikeudenTila } from '../../../globals/KayttooikeudenTila';

export type Kayttooikeusryhma = {
    id: number;
    tunniste: string;
    nimi: TextGroup;
    kuvaus: TextGroup | null | undefined;
    organisaatioViite: OrganisaatioViite[];
    rooliRajoite?: string;
    passivoitu?: boolean;
    ryhmaRestriction?: boolean;
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null | undefined;
    description: TextGroup | null | undefined; // Tämä puuttuu MyonnettyKayttooikeusryhma tyypistä
    muokattu?: string;
    muokkaaja?: string;
};

export type KayttooikeusRyhmaModify = {
    nimi: TextGroup;
    kuvaus: TextGroup;
    palvelutRoolit: PalveluRooliModify[];
    organisaatioTyypit: string[];
    rooliRajoite: string;
    slaveIds: number[];
    passivoitu: boolean;
    ryhmaRestriction: boolean;
};

export type MyonnettyKayttooikeusryhma = {
    ryhmaId: number;
    ryhmaTunniste: string;
    ryhmaNames: TextGroup;
    organisaatioOid: string;
    ryhmaKuvaus: TextGroup | null | undefined;
    myonnettyTapahtumaId: number | null | undefined;
    alkuPvm: string | null | undefined;
    voimassaPvm: string | null | undefined;
    tila: KayttooikeudenTila;
    kasitelty: string;
    kasittelijaOid: string;
    kasittelijaNimi: string;
    tyyppi: string;
    removed: boolean;
    selected: boolean;
    muutosSyy: string;
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null | undefined;
};
