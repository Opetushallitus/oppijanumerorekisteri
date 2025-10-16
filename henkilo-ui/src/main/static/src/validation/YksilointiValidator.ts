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
