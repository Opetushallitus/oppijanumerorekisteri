import { oppijaNavi, virkailijaNavi } from './navigationconfigurations';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Kayttaja } from '../../types/domain/kayttooikeus/kayttaja.types';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { Yksilointitieto } from '../../types/domain/oppijanumerorekisteri/yksilointitieto.types';
import { NaviTab } from '../../types/navigation.type';

export const enabledDuplikaattiView = (
    oidHenkilo: string | null | undefined,
    kayttaja: Kayttaja | null | undefined,
    masterLoading: boolean,
    masterHenkiloOid?: string
): boolean =>
    !masterLoading &&
    (masterHenkiloOid === undefined || masterHenkiloOid === oidHenkilo) &&
    kayttaja?.kayttajaTyyppi !== 'PALVELU';

export const enabledVtjVertailuView = (henkilo: Henkilo): boolean =>
    henkilo?.yksilointiYritetty && !henkilo?.yksiloityVTJ && !henkilo?.duplicate;

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
    henkilo: HenkiloState | undefined,
    henkiloType: string
): Array<NaviTab> => {
    const currentHenkilo = henkilo?.henkilo;
    if (!henkiloType) {
        henkiloType = 'virkailija';
    }
    const tabs = henkiloType === 'virkailija' ? virkailijaNavi(oidHenkilo) : oppijaNavi(oidHenkilo);

    const masterHenkiloOid = henkilo?.master?.oidHenkilo;

    // Wait until all needed and correct data has been fetched before enabling tabs to prevent them switching on/off
    if (
        (henkilo?.masterLoading && henkilo?.master.oidHenkilo !== oidHenkilo) ||
        (henkilo?.henkiloLoading && henkilo?.henkilo.oidHenkilo !== oidHenkilo) ||
        henkilo?.kayttajaLoading
    ) {
        return tabs;
    }

    return tabs.map((tab) => {
        if (
            tab.label === 'NAVI_HAE_DUPLIKAATIT' &&
            enabledDuplikaattiView(oidHenkilo, henkilo?.kayttaja, henkilo?.masterLoading, masterHenkiloOid)
        ) {
            tab.disabled = false;
        }
        if (
            tab.label === 'NAVI_VTJ_VERTAILU' &&
            enabledVtjVertailuView(currentHenkilo) &&
            vtjDataAvailable(henkilo?.yksilointitiedot)
        ) {
            tab.disabled = false;
        }
        return tab;
    });
};
