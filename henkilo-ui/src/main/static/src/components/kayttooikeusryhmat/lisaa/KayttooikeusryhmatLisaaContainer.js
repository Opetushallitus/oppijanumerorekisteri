// @flow
import React from 'react';
import {connect} from 'react-redux';
import {kayttooikeusryhmatNavigation} from '../../navigation/navigationconfigurations';
import {updateNavigation} from '../../../actions/navigation.actions';
import KayttooikeusryhmatLisaaPage from './KayttooikeusryhmatLisaaPage';
import {fetchOmattiedotOrganisaatios} from '../../../actions/omattiedot.actions';
import Loader from "../../common/icons/Loader";


type Props = {
    L: any,
    updateNavigation: (Array<any>, string) => void,
    fetchOmattiedotOrganisaatios: () => void,
    organisaatio: any
}

class KayttooikeusryhmatLisaaContainer extends React.Component<Props> {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/');
        this.props.fetchOmattiedotOrganisaatios();
    }

    render() {
        return this.props.organisaatio.organisaatioLoading ? <Loader /> : <KayttooikeusryhmatLisaaPage {...this.props} />;
    }

}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    organisaatio: state.organisaatio
});

export default connect(mapStateToProps, {updateNavigation, fetchOmattiedotOrganisaatios})(KayttooikeusryhmatLisaaContainer)