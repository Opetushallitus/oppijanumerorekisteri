// @flow
import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames/bind';
import ophLogo from '../../img/logo_oph.svg';
import okmLogo from '../../img/logo_okm.png';
import type { L } from '../../types/localisation.type'
import type { NaviTab } from '../../types/navigation.type'

import './TopNavigation.css';

type Props = {
    tabs: Array<NaviTab>,
    pathName: ?string,
    backButton: ?string,
    L: L,
    rekisterinpitaja: boolean,
}

const TopNavigation = ({tabs, pathName, backButton, L, rekisterinpitaja}: Props) => {
    return (
        <div id="topNavigation">
            { backButton ? <Link className="oph-link oph-link-big" to={backButton} >&#8701; {L['TAKAISIN_LINKKI']}</Link> : null }
            { tabs.length
                ? <ul className="tabs">
                    {tabs
                        .filter(data =>  !data.vainRekisterinpitajalle || rekisterinpitaja)
                        .map((data, index) => {
                        const className = classNames({
                            'active': data.path === pathName,
                            'disabled-link': data.disabled
                        });
                        return <li key={index}>
                            <Link className={className} to={data.path} >{data.label}</Link>
                        </li>;
                    }
                    )}
                </ul>
                : backButton === null && <div><img src={ophLogo} alt="oph logo" id="ophlogo"/> <img src={okmLogo} alt="okm logo" id="okmlogo"/></div>}
        </div>
    )
};

export default TopNavigation;
