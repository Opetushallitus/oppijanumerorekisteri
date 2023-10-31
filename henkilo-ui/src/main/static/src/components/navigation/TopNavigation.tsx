import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import { Link } from 'react-router';
import classNames from 'classnames/bind';
import { urls } from 'oph-urls-js';

import { parsePalveluRoolit } from '../../utilities/palvelurooli.util';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { RouteType } from '../../routes';
import AngleDownIcon from '../common/icons/AngleDownIcon';
import PlaceholderIcon from '../common/icons/PlaceholderIcon';
import { useLocalisations } from '../../selectors';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';

import './TopNavigation.css';

type OwnProps = {
    pathName: string | null | undefined;
    route: RouteType;
    params?: {
        [key: string]: string;
    };
};

type StateProps = {
    henkilo?: HenkiloState;
};

type Props = OwnProps & StateProps;

const TopNavigation = ({ pathName, route, params, henkilo }: Props) => {
    const { L } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const organisaatioList = !Array.isArray(omattiedot.organisaatiot) ? [] : omattiedot.organisaatiot;
    const roolit = parsePalveluRoolit(organisaatioList);
    const naviTabs = route.getNaviTabs && route.getNaviTabs(params && params['oid'], henkilo, route.henkiloType);

    useMemo(() => {
        const script = document.createElement('script');
        script.src = urls.url('virkailija-raamit.raamit.js');
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div id="topNavigation" className="oph-bg-blue">
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
                {naviTabs?.length > 0 &&
                    naviTabs
                        .filter(
                            (data) =>
                                omattiedot.isAdmin ||
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
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(TopNavigation);
