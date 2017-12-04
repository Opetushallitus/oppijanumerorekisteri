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
    const roolit = isNoAuthenticationPage || !Array.isArray(organisaatiot) ? [] : organisaatiot
        .map(organisaatio => organisaatio.kayttooikeudet.map(kayttooikeus => `${kayttooikeus.palvelu}_${kayttooikeus.oikeus}`))
        .reduce((prev, curr) => prev.concat(curr)); // flatten
    return (
        <div id="topNavigation">
            {/* Virkailija-raamit looks bad in dev mode because styles are in wrong path. */}
            { !isNoAuthenticationPage && <Script url={urls.url('virkailija-raamit.raamit.js')}/> }
            { naviOptions.backButton ? <Link className="oph-link oph-link-big" to={naviOptions.backButton} >&#8701; {L['TAKAISIN_LINKKI']}</Link> : null }
            { !isNoAuthenticationPage && naviTabs.length > 0
            && <ul className="tabs">
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
                            <Link className={className} to={data.path}>{L[data.label] || data.label}</Link>
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

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    naviTabs: state.naviState.naviTabs,
    isRekisterinpitaja: state.omattiedot.isAdmin,
    organisaatiot: state.omattiedot.organisaatiot,
    naviOptions: state.naviState.naviOptions,
});

export default connect(mapStateToProps, {})(TopNavigation);
