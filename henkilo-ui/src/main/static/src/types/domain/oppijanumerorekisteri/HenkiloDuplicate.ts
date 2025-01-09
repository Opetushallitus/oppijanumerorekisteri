import { Kielisyys } from './kielisyys.types';
import { Kansalaisuus } from './kansalaisuus.types';
import type { Henkilo, HenkiloCreate } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';
import type { Kayttaja } from '../../../types/domain/kayttooikeus/kayttaja.types';
import { Hakemus } from './Hakemus.type';

export type HenkiloDuplicateLenient = {
    henkilo: HenkiloCreate | Henkilo;
    duplicates: HenkiloDuplicate[];
    duplicatesLoading?: boolean;
    kayttaja?: Kayttaja;
    masterLoading?: boolean;
    master?: {
        oidHenkilo: string;
    };
};

export type HenkiloDuplicate = {
    oidHenkilo?: string;
    etunimet?: string;
    kutsumanimi?: string;
    sukunimi?: string;
    sukupuoli?: string;
    hetu?: string;
    syntymaaika?: string;
    passivoitu?: boolean;
    email?: string;
    emails?: string[];
    yksiloity?: boolean;
    yksiloityVTJ?: boolean;
    aidinkieli?: Kielisyys;
    asiointiKieli?: Kielisyys;
    hakemukset?: Hakemus[];
    passinumerot?: string[];
    kansalaisuus?: Kansalaisuus[];
};
