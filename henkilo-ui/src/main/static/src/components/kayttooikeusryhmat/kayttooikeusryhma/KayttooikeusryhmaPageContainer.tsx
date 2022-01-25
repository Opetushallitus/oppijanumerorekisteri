import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../reducers';
import KayttooikeusryhmaPage from './KayttooikeusryhmaPage';
import { fetchOmattiedotOrganisaatios } from '../../../actions/omattiedot.actions';
import { fetchOppilaitostyypit, fetchOrganisaatiotyypit } from '../../../actions/koodisto.actions';
import { fetchAllOrganisaatios } from '../../../actions/organisaatio.actions';
import {
    fetchAllKayttooikeusryhma,
    fetchKayttooikeusryhmaById,
    fetchPalveluRooliByKayttooikeusryhmaId,
    fetchKayttooikeusryhmaSlaves,
} from '../../../actions/kayttooikeusryhma.actions';
import Loader from '../../common/icons/Loader';
import { Locale } from '../../../types/locale.type';
import { fetchAllPalvelut } from '../../../actions/palvelut.actions';
import { PalvelutState } from '../../../reducers/palvelut.reducer';
import { fetchPalveluKayttooikeus } from '../../../actions/kayttooikeus.actions';
import { KayttooikeusState } from '../../../reducers/kayttooikeus.reducer';
import { Localisations } from '../../../types/localisation.type';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';
import { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { OrganisaatioCriteria } from '../../../types/domain/organisaatio/organisaatio.types';

type OwnProps = {
    router: any;
    routeParams: any;
};

type StateProps = {
    L: Localisations;
    organisaatios: Array<OrganisaatioHenkilo>;
    organisaatioCache: OrganisaatioCache;
    koodisto: any;
    locale: Locale;
    kayttooikeus: any;
    kayttooikeusState: KayttooikeusState;
    palvelutState: PalvelutState;
    omattiedotOrganisaatiosLoading: boolean;
    kayttooikeusryhmaId?: string;
};

type DispatchProps = {
    fetchKayttooikeusryhmaById: (id: string) => void;
    fetchPalveluRooliByKayttooikeusryhmaId: (id: string) => void;
    fetchOmattiedotOrganisaatios: () => void;
    fetchOppilaitostyypit: () => void;
    fetchOrganisaatiotyypit: () => void;
    fetchAllKayttooikeusryhma: () => void;
    fetchAllPalvelut: () => void;
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void;
    fetchKayttooikeusryhmaSlaves: (id: string) => void;
    fetchPalveluKayttooikeus: (palveluName: string) => void;
    addGlobalNotification: (payload: GlobalNotificationConfig) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class KayttooikeusryhmaPageContainer extends React.Component<Props> {
    componentDidMount() {
        const kayttooikeusryhmaId: string | null | undefined = this.props.kayttooikeusryhmaId;
        this.props.fetchOmattiedotOrganisaatios();
        this.props.fetchAllKayttooikeusryhma();
        this.props.fetchOppilaitostyypit();
        this.props.fetchOrganisaatiotyypit();
        this.props.fetchAllPalvelut();
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
            this.props.kayttooikeus.allKayttooikeusryhmasLoading ||
            this.props.palvelutState.palvelutLoading ||
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
    organisaatios: state.omattiedot.organisaatios,
    organisaatioCache: state.organisaatio.cached,
    koodisto: state.koodisto,
    locale: state.locale,
    kayttooikeus: state.kayttooikeus,
    palvelutState: state.palvelutState,
    kayttooikeusState: state.kayttooikeusState,
    omattiedotOrganisaatiosLoading: state.omattiedot.omattiedotOrganisaatiosLoading,
});

export default connect<StateProps, DispatchProps>(mapStateToProps, {
    fetchOmattiedotOrganisaatios,
    fetchKayttooikeusryhmaById,
    fetchPalveluRooliByKayttooikeusryhmaId,
    fetchOppilaitostyypit,
    fetchOrganisaatiotyypit,
    fetchAllKayttooikeusryhma,
    fetchAllPalvelut,
    fetchPalveluKayttooikeus,
    fetchKayttooikeusryhmaSlaves,
    fetchAllOrganisaatios,
    addGlobalNotification,
})(KayttooikeusryhmaPageContainer);
