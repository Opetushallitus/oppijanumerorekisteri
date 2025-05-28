import React from 'react';
import { connect } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import type { RootState } from '../../../store';
import KayttooikeusryhmaPage from './KayttooikeusryhmaPage';
import { fetchOppilaitostyypit, fetchOrganisaatiotyypit } from '../../../actions/koodisto.actions';
import { fetchAllOrganisaatios } from '../../../actions/organisaatio.actions';
import {
    fetchKayttooikeusryhmaById,
    fetchPalveluRooliByKayttooikeusryhmaId,
    fetchKayttooikeusryhmaSlaves,
} from '../../../actions/kayttooikeusryhma.actions';
import Loader from '../../common/icons/Loader';
import { Locale } from '../../../types/locale.type';
import { Localisations } from '../../../types/localisation.type';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';
import { OrganisaatioCriteria } from '../../../types/domain/organisaatio/organisaatio.types';
import { KoodistoState } from '../../../reducers/koodisto.reducer';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';

type OwnProps = {
    router: RouteActions;
    routeParams: { id?: string };
};

type StateProps = {
    L: Localisations;
    organisaatioCache: OrganisaatioCache;
    koodisto: KoodistoState;
    locale: Locale;
    kayttooikeus: KayttooikeusRyhmaState;
    kayttooikeusryhmaId?: string;
};

type DispatchProps = {
    fetchKayttooikeusryhmaById: (id: string) => void;
    fetchPalveluRooliByKayttooikeusryhmaId: (id: string) => void;
    fetchOppilaitostyypit: () => void;
    fetchOrganisaatiotyypit: () => void;
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void;
    fetchKayttooikeusryhmaSlaves: (id: string) => void;
    addGlobalNotification: (payload: GlobalNotificationConfig) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class KayttooikeusryhmaPageContainer extends React.Component<Props> {
    componentDidMount() {
        const kayttooikeusryhmaId: string | null | undefined = this.props.kayttooikeusryhmaId;
        this.props.fetchOppilaitostyypit();
        this.props.fetchOrganisaatiotyypit();
        this.props.fetchAllOrganisaatios({
            tyyppi: 'ORGANISAATIO',
            tila: ['AKTIIVINEN', 'PASSIIVINEN'],
        });
        if (kayttooikeusryhmaId) {
            this.props.fetchKayttooikeusryhmaById(kayttooikeusryhmaId);
            this.props.fetchPalveluRooliByKayttooikeusryhmaId(kayttooikeusryhmaId);
            this.props.fetchKayttooikeusryhmaSlaves(kayttooikeusryhmaId);
        }
    }

    render() {
        return this.props.koodisto.oppilaitostyypitLoading ||
            this.props.koodisto.organisaatiotyyppiKoodistoLoading ||
            this.props.kayttooikeus.kayttooikeusryhmaLoading ||
            (this.props.kayttooikeus.palvelutRoolitLoading && this.props.kayttooikeusryhmaId) ||
            this.props.kayttooikeus.kayttooikeusryhmaSlavesLoading ? (
            <Loader />
        ) : (
            <KayttooikeusryhmaPage {...this.props} />
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    kayttooikeusryhmaId: ownProps.routeParams['id'],
    L: state.l10n.localisations[state.locale],
    organisaatioCache: state.organisaatio.cached,
    koodisto: state.koodisto,
    locale: state.locale,
    kayttooikeus: state.kayttooikeus,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchKayttooikeusryhmaById,
    fetchPalveluRooliByKayttooikeusryhmaId,
    fetchOppilaitostyypit,
    fetchOrganisaatiotyypit,
    fetchKayttooikeusryhmaSlaves,
    fetchAllOrganisaatios,
    addGlobalNotification,
})(KayttooikeusryhmaPageContainer);
