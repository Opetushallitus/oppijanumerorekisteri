import React from 'react';
import {connect} from 'react-redux';
import {deleteKutsu, fetchKutsus} from '../actions/kutsu.actions';
import KutsututPage from '../components/kutsutut/KutsututPage';

class KutsututPageContainer extends React.Component {
    componentDidMount() {
        this.props.fetchKutsus();
    }
    render() {
        return <KutsututPage {...this.props} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        kutsuList: state.kutsuList,
        l10n: state.l10n.localisations,
        locale: state.locale
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        deleteKutsu: (msg) => dispatch(deleteKutsu(msg)),
        fetchKutsus: (orderBy, direction) => dispatch(fetchKutsus(orderBy, direction))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(KutsututPageContainer)
