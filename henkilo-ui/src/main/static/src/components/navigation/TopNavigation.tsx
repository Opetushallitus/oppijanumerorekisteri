import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import { Link } from 'react-router';
import classNames from 'classnames/bind';
import ophLogo from '../../img/logo_oph.svg';
import okmLogo from '../../img/logo_okm.png';
import { Localisations } from '../../types/localisation.type';
import { urls } from 'oph-urls-js';
import './TopNavigation.css';
import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { RouteType } from '../../routes';
import AngleDownIcon from '../common/icons/AngleDownIcon';
import PlaceholderIcon from '../common/icons/PlaceholderIcon';
import { KayttooikeusOrganisaatiot } from '../../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';

type OwnProps = {
    pathName: string | null | undefined;
    route: RouteType;
    params?: {
        [key: string]: string;
    };
};

type StateProps = {
    L: Localisations;
    isRekisterinpitaja: boolean;
    organisaatiot: Array<KayttooikeusOrganisaatiot>;
    henkilo?: HenkiloState;
};

type Props = OwnProps & StateProps;

const TopNavigation = ({ pathName, L, isRekisterinpitaja, organisaatiot, route, params, henkilo }: Props) => {
    const isNoAuthenticationPage = route.isUnauthenticated;
    const organisaatioList = isNoAuthenticationPage || !Array.isArray(organisaatiot) ? [] : organisaatiot;
    const roolit: Array<string> = parsePalveluRoolit(organisaatioList);
    const naviTabs = route.getNaviTabs && route.getNaviTabs(params && params['oid'], henkilo, route.henkiloType);

    useMemo(() => {
        const script = document.createElement('script');
        script.src = urls.url('virkailija-raamit.raamit.js');
        if (!isNoAuthenticationPage) {
            document.body.appendChild(script);
        }

        return () => {
            if (!isNoAuthenticationPage) {
                document.body.removeChild(script);
            }
        };
    }, [isNoAuthenticationPage]);

    return (
        <div id="topNavigation" className={classNames({ 'oph-bg-blue': !isNoAuthenticationPage })}>
            {!isNoAuthenticationPage && (
                <ul className="tabs">
                    {route.backButton ? (
                        <li>
                            <a
                                href="?"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.history.go(-1);
                                    return false;
                                }}
                            >
                                &#8701; {L['TAKAISIN_LINKKI']} <PlaceholderIcon />
                            </a>
                        </li>
                    ) : null}
                    {naviTabs &&
                        naviTabs.length > 0 &&
                        naviTabs
                            .filter(
                                (data) =>
                                    isRekisterinpitaja ||
                                    !data.sallitutRoolit ||
                                    data.sallitutRoolit.some((sallittuRooli) => roolit.includes(sallittuRooli))
                            )
                            .map((data, index) => {
                                const className = classNames({
                                    active: data.path === pathName,
                                    'disabled-link': data.disabled,
                                });
                                return (
                                    <li key={index}>
                                        <Link className={className} to={data.path}>
                                            {L[data.label] || data.label}
                                            {data.path === pathName ? <AngleDownIcon /> : <PlaceholderIcon />}
                                        </Link>
                                    </li>
                                );
                            })}
                </ul>
            )}
            {isNoAuthenticationPage && (
                <div>
                    <img src={ophLogo} alt="oph logo" id="ophlogo" /> <img src={okmLogo} alt="okm logo" id="okmlogo" />
                </div>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    isRekisterinpitaja: state.omattiedot.isAdmin,
    organisaatiot: state.omattiedot.organisaatiot,
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(TopNavigation);
