// @flow
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import classNames from 'classnames/bind';
import ophLogo from '../../img/logo_oph.svg';
import okmLogo from '../../img/logo_okm.png';
import type { L } from '../../types/localisation.type'
import type {NaviTab} from '../../types/navigation.type'
import Script from 'react-load-script';
import {urls} from 'oph-urls-js';

import './TopNavigation.css';
import {parsePalveluRoolit} from "../../utilities/palvelurooli.util";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {RouteType} from "../../routes";
import AngleDownIcon from "../common/icons/AngleDownIcon";
import PlaceholderIcon from "../common/icons/PlaceholderIcon";

type Props = {
    naviTabs: Array<NaviTab>,
    pathName: ?string,
    L: L,
    isRekisterinpitaja: boolean,
    organisaatiot: Array<any>,
    route: RouteType,
    henkilo?: HenkiloState,
    params?: {[string]: string},
}

const TopNavigation = ({pathName, L, isRekisterinpitaja, organisaatiot, route, params, henkilo}: Props) => {
    const isNoAuthenticationPage = route.isUnauthenticated;
    const organisaatioList = isNoAuthenticationPage || !Array.isArray(organisaatiot) ? [] : organisaatiot;
    const roolit: Array<string> = parsePalveluRoolit(organisaatioList);
    const naviTabs = route.getNaviTabs && route.getNaviTabs(params && params['oid'], henkilo, route.henkiloType);
    return (
        <div id="topNavigation" className={classNames({'oph-bg-blue': !isNoAuthenticationPage})}>
            {/* Virkailija-raamit looks bad in dev mode because styles are in wrong path. */}
            { !isNoAuthenticationPage && <Script url={urls.url('virkailija-raamit.raamit.js')}/> }
            { !isNoAuthenticationPage
            && <ul className="tabs">
                {/*eslint-disable no-script-url*/}
                { route.backButton ? <li><a href="javascript:history.go(-1)">&#8701; {L['TAKAISIN_LINKKI']} <PlaceholderIcon /></a></li> : null }
                {/*eslint-enable no-script-url*/}
                { naviTabs && naviTabs.length > 0
                && naviTabs
                    .filter(data => isRekisterinpitaja
                        || !data.sallitutRoolit
                        || data.sallitutRoolit.some(sallittuRooli => roolit.includes(sallittuRooli)))
                    .map((data, index) => {
                        const className = classNames({
                            'active': data.path === pathName,
                            'disabled-link': data.disabled
                        });
                        return <li key={index}>
                            <Link className={className} to={data.path}>
                                {L[data.label] || data.label}
                                {data.path === pathName ? <AngleDownIcon /> : <PlaceholderIcon />}
                            </Link>
                        </li>;
                    })
                }
            </ul>
            }
            { isNoAuthenticationPage && <div><img src={ophLogo} alt="oph logo" id="ophlogo"/> <img src={okmLogo} alt="okm logo" id="okmlogo"/></div>}
        </div>
    );
};

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    isRekisterinpitaja: state.omattiedot.isAdmin,
    organisaatiot: state.omattiedot.organisaatiot,
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(TopNavigation);
