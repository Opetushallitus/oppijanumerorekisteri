import React, { useMemo } from 'react';
import { NavLink } from 'react-router';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';
import AngleDownIcon from '../common/icons/AngleDownIcon';
import PlaceholderIcon from '../common/icons/PlaceholderIcon';
import { useLocalisations } from '../../selectors';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { RootState } from '../../store';

import './TopNavigation.css';

export const isNewNavi =
    window.location.hostname.includes('virkailija.hahtuvaopintopolku.fi') ||
    window.location.hostname.includes('virkailija.untuvaopintopolku.fi') ||
    window.location.hostname.includes('localhost');

export const TopNavigation = () => {
    const { L } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const navigation = useSelector((state: RootState) => state.navigation);

    useMemo(() => {
        const script = document.createElement('script');
        script.src = '/virkailija-raamit/apply-raamit.js';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    if (!omattiedot) {
        return <div></div>;
    }

    const roolit = parsePalveluRoolit(omattiedot.organisaatiot) ?? [];
    return !isNewNavi ? (
        <div id="topNavigation" className="oph-bg-blue">
            <ul className="tabs">
                {navigation.backButton ? (
                    <li>
                        <a
                            href="?"
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.back();
                            }}
                        >
                            &#8701; {L('TAKAISIN_LINKKI')} <PlaceholderIcon />
                        </a>
                    </li>
                ) : null}
                {navigation.tabs
                    .filter(
                        (tab) =>
                            omattiedot.isAdmin ||
                            !tab.sallitutRoolit ||
                            tab.sallitutRoolit.some((r) => !!r && roolit.includes(r))
                    )
                    .map((tab, index) => (
                        <li key={index}>
                            <NavLink
                                className={({ isActive }) =>
                                    classNames({
                                        active: isActive,
                                        'disabled-link': tab.disabled,
                                    })
                                }
                                to={tab.path}
                                end
                            >
                                {({ isActive }) => (
                                    <span>
                                        {L(tab.label)}
                                        {isActive ? <AngleDownIcon /> : <PlaceholderIcon />}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
            </ul>
        </div>
    ) : (
        <div className="oph-ds-navigation" role="navigation">
            {navigation.backButton ? (
                <a
                    className="oph-ds-navlink"
                    href="?"
                    onClick={(e) => {
                        e.preventDefault();
                        window.history.back();
                    }}
                >
                    &#8701; {L('TAKAISIN_LINKKI')}
                </a>
            ) : null}
            {navigation.tabs
                .filter(
                    (tab) =>
                        omattiedot.isAdmin ||
                        !tab.sallitutRoolit ||
                        tab.sallitutRoolit.some((r) => !!r && roolit.includes(r))
                )
                .map((tab, index) => (
                    <NavLink
                        key={index}
                        className={({ isActive }) =>
                            `oph-ds-navlink ${isActive ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`
                        }
                        to={tab.path}
                        end
                    >
                        {L(tab.label) ?? tab.label}
                    </NavLink>
                ))}
        </div>
    );
};
