import { KayttooikeudenTila } from '../../../globals/KayttooikeudenTila';
import { Anomus } from './Anomus.types';
import { Kayttooikeusryhma } from './kayttooikeusryhma.types';

export type HaettuKayttooikeusryhma = {
    id: number;
    anomus: Anomus;
    kayttoOikeusRyhma: Kayttooikeusryhma;
    kasittelyPvm: string | null;
    tyyppi: KayttooikeudenTila | null;
};
