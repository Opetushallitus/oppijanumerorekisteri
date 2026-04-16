import React, { useMemo } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';

import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';
import { useLocalisations } from '../../selectors';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { RootState } from '../../store';

import './TopNavigation.css';

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
    return (
        <div className="oph-ds-navigation" role="navigation">
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
