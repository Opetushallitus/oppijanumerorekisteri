import React from 'react'
import {connect} from 'react-redux';
import OppijaViewPage from "../../components/henkilo/OppijaViewPage";
import {
    fetchHenkilo, passivoiHenkilo, updateHenkiloAndRefetch, updateKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../../configuration/navigationconfigurations";


const OppijaViewContainer = React.createClass({
    componentDidMount: function() {
        this.props.updateNavigation(oppijaNavi(this.props.oid), '/henkilo');

        this.props.fetchHenkilo(this.props.oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
    },
    render: function() {
        return <OppijaViewPage {...this.props} />;
    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oid: ownProps.params['oid'],
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
fetchKansalaisuusKoodisto, updateHenkiloAndRefetch, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateKayttajatieto, updateNavigation})(OppijaViewContainer)