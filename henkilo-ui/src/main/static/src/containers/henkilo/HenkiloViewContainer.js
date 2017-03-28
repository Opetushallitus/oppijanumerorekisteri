import React from 'react'
import {connect} from 'react-redux';
import HenkiloViewPage from "../../components/henkilo/HenkiloViewPage";
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, updateHenkilo,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";


const HenkiloViewContainer = React.createClass({
    componentDidMount: function() {
        this.props.fetchHenkilo(this.props.oid);
        this.props.fetchHenkiloOrgs(this.props.oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttajatieto(this.props.oid);
    },
    render: function() {
        return <HenkiloViewPage {...this.props} />;
    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1),
        oid: ownProps.params['oid'],
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchHenkilo: oid => dispatch(fetchHenkilo(oid)),
        fetchHenkiloOrgs: oid => dispatch(fetchHenkiloOrgs(oid)),
        fetchYhteystietotyypitKoodisto: () => dispatch(fetchYhteystietotyypitKoodisto()),
        fetchKieliKoodisto: () => dispatch(fetchKieliKoodisto()),
        fetchKansalaisuusKoodisto: () => dispatch(fetchKansalaisuusKoodisto()),
        fetchSukupuoliKoodisto: () => dispatch(fetchSukupuoliKoodisto()),
        updateHenkilo: (payload) => dispatch(updateHenkilo(payload)),
        fetchKayttajatieto: (oid) => dispatch(fetchKayttajatieto(oid)),
        updatePassword: (oid, password) => dispatch(updatePassword(oid, password)),
        passivoiHenkilo: (oid) => dispatch(passivoiHenkilo(oid)),
        yksiloiHenkilo: (oid) => dispatch(yksiloiHenkilo(oid)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(HenkiloViewContainer)