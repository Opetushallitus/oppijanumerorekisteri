// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import classNames from 'classnames/bind';
import ophLogo from '../../img/logo_oph.svg';
import okmLogo from '../../img/logo_okm.png';
import type { L } from '../../types/localisation.type'
import type {NaviOptions, NaviTab} from '../../types/navigation.type'
import Script from 'react-load-script';
import {urls} from 'oph-urls-js';

import './TopNavigation.css';
import {parsePalveluRoolit} from "../../utilities/palvelurooli.util";

type Props = {
    naviTabs: Array<NaviTab>,
    pathName: ?string,
    L: L,
    isRekisterinpitaja: boolean,
    organisaatiot: Array<any>,
    naviOptions: NaviOptions,
}

const TopNavigation = ({naviTabs, pathName, naviOptions, L, isRekisterinpitaja, organisaatiot}: Props) => {
    const isNoAuthenticationPage = naviOptions.isUnauthenticatedPage;
    const organisaatioList = isNoAuthenticationPage || !Array.isArray(organisaatiot) ? [] : organisaatiot;
    const roolit: Array<string> = parsePalveluRoolit(organisaatioList);
    return (
        <div id="topNavigation" className={classNames({'oph-bg-blue': !isNoAuthenticationPage})}>
            {/* Virkailija-raamit looks bad in dev mode because styles are in wrong path. */}
            { !isNoAuthenticationPage && <Script url={urls.url('virkailija-raamit.raamit.js')}/> }
            { !isNoAuthenticationPage && naviTabs.length > 0
            && <ul className="tabs">
                {/*eslint-disable no-script-url*/}
                { naviOptions.backButton ? <li><a href="javascript:history.go(-1)">&#8701; {L['TAKAISIN_LINKKI']} <i className="fa fa-fw" aria-hidden="true">&nbsp;</i></a></li> : null }
                {/*eslint-enable no-script-url*/}
                { naviTabs
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
                                {data.path === pathName && <i className="fa fa-angle-down" aria-hidden="true"></i>}
                                {data.path !== pathName && <i className="fa fa-fw" aria-hidden="true">&nbsp;</i>}
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

TopNavigation.propTypes = {
    pathName: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    naviTabs: state.naviState.naviTabs,
    isRekisterinpitaja: state.omattiedot.isAdmin,
    organisaatiot: state.omattiedot.organisaatiot,
    naviOptions: state.naviState.naviOptions,
});

export default connect(mapStateToProps, {})(TopNavigation);
