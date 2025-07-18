import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import classNames from 'classnames';
import { urls } from 'oph-urls-js';
import { useSelector } from 'react-redux';

import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';
import AngleDownIcon from '../common/icons/AngleDownIcon';
import PlaceholderIcon from '../common/icons/PlaceholderIcon';
import { useLocalisations } from '../../selectors';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { RootState } from '../../store';

import './TopNavigation.css';

export const TopNavigation = () => {
    const { L } = useLocalisations();
    const location = useLocation();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const navigation = useSelector((state: RootState) => state.navigation);

    useMemo(() => {
        const script = document.createElement('script');
        script.src = urls.url('virkailija-raamit.raamit.js');
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    if (!omattiedot) {
        return <div></div>;
    }

    const roolit = parsePalveluRoolit(omattiedot.organisaatiot) ?? [];
    return (
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
                            &#8701; {L['TAKAISIN_LINKKI']} <PlaceholderIcon />
                        </a>
                    </li>
                ) : null}
                {navigation.tabs.length > 0 &&
                    navigation.tabs
                        .filter(
                            (tab) =>
                                omattiedot.isAdmin ||
                                !tab.sallitutRoolit ||
                                tab.sallitutRoolit.some((r) => !!r && roolit.includes(r))
                        )
                        .map((tab, index) => {
                            const className = classNames({
                                active: tab.path === location.pathname,
                                'disabled-link': tab.disabled,
                            });
                            return (
                                <li key={index}>
                                    <Link className={className} to={tab.path}>
                                        {L[tab.label] ?? tab.label}
                                        {tab.path === location.pathname ? <AngleDownIcon /> : <PlaceholderIcon />}
                                    </Link>
                                </li>
                            );
                        })}
            </ul>
        </div>
    );
};
