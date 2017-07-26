import React from 'react';
import {connect} from 'react-redux';
import {deleteKutsu, fetchKutsus} from '../actions/kutsu.actions';
import KutsututPage from '../components/kutsutut/KutsututPage';

class KutsututPageContainer extends React.Component {
    componentDidMount() {
        this.props.fetchKutsus(undefined, undefined, true);
    }
    render() {
        return <KutsututPage {...this.props} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        kutsus: state.kutsuList,
        l10n: state.l10n.localisations,
        locale: state.locale
    };
};

export default connect(mapStateToProps, {fetchKutsus, deleteKutsu})(KutsututPageContainer)
