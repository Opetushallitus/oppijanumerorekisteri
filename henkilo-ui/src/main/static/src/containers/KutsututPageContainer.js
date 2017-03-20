import React from 'react';
import {connect} from 'react-redux';
import {deleteKutsu, fetchKutsus} from '../actions/actions';
import KutsututPage from '../components/kutsutut/KutsututPage';
// import {l10n} from '../l10n'

const KutsututPageContainer = React.createClass({
    componentDidMount: function() {
        this.props.fetchKutsus();
    },
    render: function() {
        return <KutsututPage {...this.props} l10n={this.props.l10n}/>;
    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1),
        kutsuList: state.kutsuList,
        l10n: state.l10n.localisations,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        deleteKutsu: (msg) => dispatch(deleteKutsu(msg)),
        fetchKutsus: (orderBy, direction) => dispatch(fetchKutsus(orderBy, direction))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(KutsututPageContainer)
