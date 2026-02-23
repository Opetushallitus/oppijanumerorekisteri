import { oppijaNavi, virkailijaNavi } from './navigationconfigurations';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Yksilointitieto } from '../../types/domain/oppijanumerorekisteri/yksilointitieto.types';
import { NaviTab } from '../../types/navigation.type';

export const enabledDuplikaattiView = (oidHenkilo: string | null | undefined, masterHenkiloOid?: string): boolean =>
    masterHenkiloOid === undefined || masterHenkiloOid === oidHenkilo;

export const enabledVtjVertailuView = (henkilo?: Henkilo): boolean =>
    !!henkilo?.yksilointiYritetty && !henkilo?.yksiloityVTJ && !henkilo?.duplicate;

export const vtjDataAvailable = (yksilointitieto: Yksilointitieto | null | undefined): boolean =>
    !!yksilointitieto?.etunimet ||
    !!yksilointitieto?.sukunimi ||
    !!yksilointitieto?.kutsumanimi ||
    !!yksilointitieto?.yhteystiedot ||
    !!yksilointitieto?.sukupuoli;

/*
 * Get tabs for a view in henkilo-component
 *
 * @Params (String oidHenkilo, Object Henkilo, String viewType [admin/virkailija])
 */
export const henkiloViewTabs = (
    oidHenkilo: string,
    henkilo: Henkilo | undefined,
    henkiloType: 'virkailija' | 'oppija',
    masterHenkiloOid?: string,
    yksilointitiedot?: Yksilointitieto
): NaviTab[] => {
    const tabs = henkiloType === 'virkailija' ? virkailijaNavi(oidHenkilo) : oppijaNavi(oidHenkilo);

    // Wait until all needed and correct data has been fetched before enabling tabs to prevent them switching on/off
    if (!henkilo || henkilo?.oidHenkilo !== oidHenkilo) {
        return tabs;
    }

    return tabs.map((tab) => {
        if (tab.label === 'NAVI_HAE_DUPLIKAATIT' && enabledDuplikaattiView(oidHenkilo, masterHenkiloOid)) {
            tab.disabled = false;
        }
        if (
            tab.label === 'NAVI_VTJ_VERTAILU' &&
            enabledVtjVertailuView(henkilo) &&
            vtjDataAvailable(yksilointitiedot)
        ) {
            tab.disabled = false;
        }
        return tab;
    });
};
