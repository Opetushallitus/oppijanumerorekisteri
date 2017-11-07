import React from 'react';
import {connect} from 'react-redux';
import {clearKutsuList, deleteKutsu, fetchKutsus} from '../actions/kutsu.actions';
import KutsututPage from '../components/kutsutut/KutsututPage';
import {fetchOmattiedotOrganisaatios} from '../actions/omattiedot.actions';

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
        organisaatiot: state.omattiedot.organisaatios,
        isAdmin: state.omattiedot.isAdmin,
        isOphVirkailija: state.omattiedot.isOphVirkailija,
    };
};

export default connect(mapStateToProps, {fetchKutsus, deleteKutsu, fetchOmattiedotOrganisaatios, clearKutsuList})(KutsututPageContainer)
