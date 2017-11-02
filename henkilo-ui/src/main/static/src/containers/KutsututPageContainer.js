import React from 'react';
import {connect} from 'react-redux';
import {clearKutsuList, deleteKutsu, fetchKutsus} from '../actions/kutsu.actions';
import KutsututPage from '../components/kutsutut/KutsututPage';
import {fetchAllOrganisaatios} from "../actions/organisaatio.actions";

class KutsututPageContainer extends React.Component {
    render() {
        return <KutsututPage {...this.props} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        kutsus: state.kutsuList,
        l10n: state.l10n.localisations,
        locale: state.locale,
        kutsuListLoading: !state.kutsuList.loaded,
        organisaatiot: state.organisaatio.organisaatiot.organisaatiot,
        isAdmin: state.omattiedot.isAdmin,
        isOphVirkailija: state.omattiedot.isOphVirkailija,
    };
};

export default connect(mapStateToProps, {fetchKutsus, deleteKutsu, fetchAllOrganisaatios, clearKutsuList})(KutsututPageContainer)
