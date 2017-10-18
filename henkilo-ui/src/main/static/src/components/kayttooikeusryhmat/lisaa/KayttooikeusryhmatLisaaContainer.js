// @flow
import React from 'react';
import {connect} from 'react-redux';
import {kayttooikeusryhmatNavigation} from '../../navigation/navigationconfigurations';
import {updateNavigation} from '../../../actions/navigation.actions';
import KayttooikeusryhmatLisaaPage from './KayttooikeusryhmatLisaaPage';
import {fetchOmattiedotOrganisaatios} from '../../../actions/omattiedot.actions';
import {fetchOppilaitostyypit} from '../../../actions/koodisto.actions';
import {fetchAllKayttooikeusryhma} from '../../../actions/kayttooikeusryhma.actions';
import Loader from "../../common/icons/Loader";
import type {Locale} from "../../../types/locale.type";


type Props = {
    L: any,
    updateNavigation: (Array<any>, string) => void,
    fetchOmattiedotOrganisaatios: () => void,
    fetchOppilaitostyypit: () => void,
    fetchAllKayttooikeusryhma: () => void,
    omattiedot: any,
    koodisto: any,
    locale: Locale,
    kayttooikeus: any
}

class KayttooikeusryhmatLisaaContainer extends React.Component<Props> {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/');
        this.props.fetchOmattiedotOrganisaatios();
        this.props.fetchAllKayttooikeusryhma();
        this.props.fetchOppilaitostyypit();
    }

    render() {
        return this.props.omattiedot.omattiedotOrganisaatiosLoading || this.props.koodisto.oppilaitostyypitLoading || this.props.kayttooikeus.allKayttooikeusryhmasLoading ?
            <Loader /> : <KayttooikeusryhmatLisaaPage {...this.props} />;
    }

}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    omattiedot: state.omattiedot,
    koodisto: state.koodisto,
    locale: state.locale,
    kayttooikeus: state.kayttooikeus
});

export default connect(mapStateToProps, {updateNavigation, fetchOmattiedotOrganisaatios, fetchOppilaitostyypit, fetchAllKayttooikeusryhma})(KayttooikeusryhmatLisaaContainer)