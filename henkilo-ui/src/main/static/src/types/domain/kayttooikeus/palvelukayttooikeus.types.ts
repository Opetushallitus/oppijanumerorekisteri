import { Text } from './textgroup.types';

export type PalveluKayttooikeus = {
    rooli: string;
    oikeusLangs: Text[];
};

export type Kayttooikeus = {
    palveluName: string;
    palveluTexts: Text[];
    rooli: string;
    rooliTexts: Text[];
};
