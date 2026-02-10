import { HenkiloDuplicate } from '../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import { Henkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';

export const isHenkiloValidForYksilointi = (henkilo?: Henkilo | HenkiloDuplicate) => {
    return (
        henkilo?.etunimet &&
        henkilo?.sukunimi &&
        henkilo?.kutsumanimi &&
        henkilo?.sukupuoli &&
        henkilo?.syntymaaika &&
        henkilo?.aidinkieli &&
        henkilo?.kansalaisuus?.length
    );
};

const hetuRegex = new RegExp(/^\d{6}[-+ABCDEFYXWVU]\d{3}[\dA-Z]$/);
export const isValidHetu = (hetu: string) => hetuRegex.test(hetu);
