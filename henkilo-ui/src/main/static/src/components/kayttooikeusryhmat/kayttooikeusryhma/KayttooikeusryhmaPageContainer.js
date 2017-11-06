// @flow
import React from 'react';
import {connect} from 'react-redux';
import {emptyNavi} from '../../navigation/navigationconfigurations';
import {updateNavigation} from '../../../actions/navigation.actions';
import KayttooikeusryhmaPage from './KayttooikeusryhmaPage';
import {fetchOmattiedotOrganisaatios} from '../../../actions/omattiedot.actions';
import {fetchOppilaitostyypit} from '../../../actions/koodisto.actions';
import {
    fetchAllKayttooikeusryhma, fetchKayttooikeusryhmaById,
    fetchPalveluRooliByKayttooikeusryhmaId, fetchKayttooikeusryhmaSlaves
} from '../../../actions/kayttooikeusryhma.actions';
import Loader from "../../common/icons/Loader";
import type {Locale} from "../../../types/locale.type";
import {fetchAllPalvelut} from "../../../actions/palvelut.actions";
import type {PalvelutState} from "../../../reducers/palvelut.reducer";
import {fetchPalveluKayttooikeus} from "../../../actions/kayttooikeus.actions";
import type {KayttooikeusState} from "../../../reducers/kayttooikeus.reducer";
import type {L} from "../../../types/l.type";


type Props = {
    L: L,
    updateNavigation: (Array<any>, string) => void,
    fetchKayttooikeusryhmaById: (id: string) => Promise<any>,
    fetchPalveluRooliByKayttooikeusryhmaId: (id: string) => Promise<any>,
    fetchOmattiedotOrganisaatios: () => void,
    fetchOppilaitostyypit: () => void,
    fetchAllKayttooikeusryhma: () => void,
    fetchAllPalvelut: () => void,
    fetchKayttooikeusryhmaSlaves: (id: string) => Promise<any>,
    fetchPalveluKayttooikeus: (palveluName: string) => void,
    omattiedot: any,
    koodisto: any,
    locale: Locale,
    kayttooikeus: any,
    kayttooikeusState: KayttooikeusState,
    palvelutState: PalvelutState,
    router: any,
    kayttooikeusryhmaId?: string
}

class KayttooikeusryhmaPageContainer extends React.Component<Props> {

    componentDidMount() {
        const kayttooikeusryhmaId: ?string  = this.props.kayttooikeusryhmaId;
        this.props.updateNavigation(emptyNavi, '/kayttooikeusryhmat');
        this.props.fetchOmattiedotOrganisaatios();
        this.props.fetchAllKayttooikeusryhma();
        this.props.fetchOppilaitostyypit();
        this.props.fetchAllPalvelut();
        if(kayttooikeusryhmaId) {
            this.props.fetchKayttooikeusryhmaById(kayttooikeusryhmaId);
            this.props.fetchPalveluRooliByKayttooikeusryhmaId(kayttooikeusryhmaId);
            this.props.fetchKayttooikeusryhmaSlaves(kayttooikeusryhmaId);
        }
    }

    render() {
        return this.props.omattiedot.omattiedotOrganisaatiosLoading || this.props.koodisto.oppilaitostyypitLoading ||
        this.props.kayttooikeus.allKayttooikeusryhmasLoading || this.props.palvelutState.palvelutLoading ||
        this.props.kayttooikeus.kayttooikeusryhmaLoading || this.props.kayttooikeus.palvelutRoolitLoading ||
        this.props.kayttooikeus.kayttooikeusryhmaSlavesLoading ?
            <Loader/> : <KayttooikeusryhmaPage {...this.props} />;
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        kayttooikeusryhmaId: ownProps.routeParams['id'],
        L: state.l10n.localisations[state.locale],
        omattiedot: state.omattiedot,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        palvelutState: state.palvelutState,
        kayttooikeusState: state.kayttooikeusState
    }
};

export default connect(mapStateToProps, {
    updateNavigation, fetchOmattiedotOrganisaatios, fetchKayttooikeusryhmaById, fetchPalveluRooliByKayttooikeusryhmaId,
    fetchOppilaitostyypit, fetchAllKayttooikeusryhma, fetchAllPalvelut, fetchPalveluKayttooikeus, fetchKayttooikeusryhmaSlaves
})(KayttooikeusryhmaPageContainer)