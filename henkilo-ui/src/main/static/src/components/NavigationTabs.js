import R from 'ramda';
import {adminNavi, virkailijaNavi} from "../configuration/navigationconfigurations";

/*
 * Get tabs for a view in henkilo-component
 *
 * @Params (String oidHenkilo, Object Henkilo, String viewType [admin/virkailija])
 */
export const henkiloViewTabs = (oidHenkilo, henkilo, henkiloType) => {
    const currentHenkilo = R.path(['henkilo'], henkilo);
    let tabs = henkiloType === 'admin' ? adminNavi(oidHenkilo) : virkailijaNavi(oidHenkilo);

    const masterHenkiloOid = R.path(['master', 'oidHenkilo'], henkilo);

    // Wait until all needed and correct data has been fetched before enabling tabs to prevent them switching on/off
    if( (henkilo.masterLoading && henkilo.master.oidHenkilo !== oidHenkilo) || (henkilo.henkiloLoading && henkilo.henkilo.oidHenkilo !== oidHenkilo)) {
        return tabs;
    }

    return tabs.map( tab => {
        if(tab.label === 'Hae duplikaatit' && (!henkilo.masterLoading && (masterHenkiloOid === undefined || oidHenkilo === masterHenkiloOid))) {
            tab.disabled = false;
        }
        if(tab.label === 'VTJ vertailu' && (currentHenkilo.yksilointiYritetty && !currentHenkilo.yksiloityVTJ && !currentHenkilo.duplicate)) {
            tab.disabled = false;
        }
        return tab;
    });

};