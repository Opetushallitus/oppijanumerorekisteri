import { Anomus } from './Anomus.types';
import { Kayttooikeusryhma, KayttooikeudenTila } from './kayttooikeusryhma.types';

export type HaettuKayttooikeusryhma = {
    id: number;
    anomus: Anomus;
    kayttoOikeusRyhma: Kayttooikeusryhma;
    kasittelyPvm: string | null;
    tyyppi: KayttooikeudenTila | null;
};
