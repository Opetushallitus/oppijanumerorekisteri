import { Kielisyys } from './kielisyys.types';
import { Kansalaisuus } from './kansalaisuus.types';
import { Hakemus } from './Hakemus.type';

export type HenkiloDuplicate = {
    oidHenkilo?: string;
    etunimet?: string;
    kutsumanimi?: string;
    sukunimi?: string;
    sukupuoli?: '1' | '2';
    hetu?: string;
    syntymaaika?: string;
    passivoitu?: boolean;
    email?: string;
    emails?: string[];
    yksiloity?: boolean;
    yksiloityVTJ?: boolean;
    yksiloityEidas?: boolean;
    aidinkieli?: Kielisyys;
    asiointiKieli?: Kielisyys;
    hakemukset?: Hakemus[];
    passinumerot?: string[] | null;
    kansalaisuus?: Kansalaisuus[] | null;
};
