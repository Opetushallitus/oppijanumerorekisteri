// @flow

import {path, isNil} from 'ramda';
import {oppijaNavi, virkailijaNavi} from "./navigationconfigurations";
import type {Henkilo} from "../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {Tab} from "../../types/tab.types";
import type {Yksilointitieto} from "../../types/domain/oppijanumerorekisteri/yksilointitieto.types";


export const enabledDuplikaattiView = (oidHenkilo: string, masterLoading: boolean, masterHenkiloOid: string): boolean => !masterLoading && (masterHenkiloOid === undefined || masterHenkiloOid === oidHenkilo);
export const enabledVtjVertailuView = (henkilo: Henkilo): boolean => henkilo.yksilointiYritetty && !henkilo.yksiloityVTJ && !henkilo.duplicate;
export const vtjDataAvailable = (yksilointitieto: ?Yksilointitieto): boolean => !isNil(yksilointitieto) && ( !isNil(yksilointitieto.etunimet) || !isNil(yksilointitieto.sukunimi) || !isNil(yksilointitieto.kutsumanimi) || !isNil(yksilointitieto.yhteystiedot) || !isNil(yksilointitieto.sukupuoli));

/*
 * Get tabs for a view in henkilo-component
 *
 * @Params (String oidHenkilo, Object Henkilo, String viewType [admin/virkailija])
 */
export const henkiloViewTabs = (oidHenkilo: string, henkilo: HenkiloState, henkiloType: string): Array<Tab>  => {
    const currentHenkilo: any = path(['henkilo'], henkilo);
    const tabs = henkiloType === 'virkailija' ? virkailijaNavi(oidHenkilo) : oppijaNavi(oidHenkilo);

    const masterHenkiloOid: any = path(['master', 'oidHenkilo'], henkilo);

    // Wait until all needed and correct data has been fetched before enabling tabs to prevent them switching on/off
    if( (henkilo.masterLoading && henkilo.master.oidHenkilo !== oidHenkilo) || (henkilo.henkiloLoading && henkilo.henkilo.oidHenkilo !== oidHenkilo)) {
        return tabs;
    }

    return tabs.map( tab => {
        if(tab.label === 'NAVI_HAE_DUPLIKAATIT' && enabledDuplikaattiView(oidHenkilo, henkilo.masterLoading, masterHenkiloOid)) {
            tab.disabled = false;
        }
        if(tab.label === 'NAVI_VTJ_VERTAILU' && enabledVtjVertailuView(currentHenkilo) && vtjDataAvailable(path(['yksilointitiedot'], henkilo))) {
            tab.disabled = false;
        }
        return tab;
    });
};