import * as R from 'ramda';
import {adminNavi, oppijaNavi, virkailijaNavi} from "./navigationconfigurations";


export const enabledDuplikaattiView = (oidHenkilo, masterLoading, masterHenkiloOid) => !masterLoading && (masterHenkiloOid === undefined || masterHenkiloOid === oidHenkilo);
export const enabledVtjVertailuView = (henkilo) => henkilo.yksilointiYritetty && !henkilo.yksiloityVTJ && !henkilo.duplicate;

/*
 * Get tabs for a view in henkilo-component
 *
 * @Params (String oidHenkilo, Object Henkilo, String viewType [admin/virkailija])
 */
export const henkiloViewTabs = (oidHenkilo, henkilo, henkiloType) => {
    const currentHenkilo = R.path(['henkilo'], henkilo);
    let tabs;
    if (henkiloType === 'admin') {
        tabs = adminNavi(oidHenkilo);
    }
    else if (henkiloType === 'virkailija') {
        tabs = virkailijaNavi(oidHenkilo);
    }
    else {
        tabs = oppijaNavi(oidHenkilo);
    }

    const masterHenkiloOid = R.path(['master', 'oidHenkilo'], henkilo);

    // Wait until all needed and correct data has been fetched before enabling tabs to prevent them switching on/off
    if( (henkilo.masterLoading && henkilo.master.oidHenkilo !== oidHenkilo) || (henkilo.henkiloLoading && henkilo.henkilo.oidHenkilo !== oidHenkilo)) {
        return tabs;
    }

    return tabs.map( tab => {
        if(tab.label === 'NAVI_HAE_DUPLIKAATIT' && enabledDuplikaattiView(oidHenkilo, henkilo.masterLoading, masterHenkiloOid)) {
            tab.disabled = false;
        }
        if(tab.label === 'NAVI_VTJ_VERTAILU' && enabledVtjVertailuView(currentHenkilo)) {
            tab.disabled = false;
        }
        return tab;
    });
};