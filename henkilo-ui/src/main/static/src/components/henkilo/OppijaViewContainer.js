import React from 'react'
import {connect} from 'react-redux';
import {fetchHenkilo, fetchHenkiloSlaves} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../navigation/navigationconfigurations";
import PropertySingleton from '../../globals/PropertySingleton'
import HenkiloViewPage from "./HenkiloViewPage";

class OppijaViewContainer extends React.Component {
    async componentDidMount() {
        PropertySingleton.setState({externalPermissionService: this.props.externalPermissionService});

        if (this.props.isAdmin) {
            this.props.router.replace(`/admin/${this.props.oidHenkilo}`);
        }
        else {
            this.fetch(this.props.oidHenkilo)
        }
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            this.fetch(nextProps.oidHenkilo)
        }
    }

    async fetch(oid) {
        this.props.updateHenkiloNavigation(oppijaNavi(oid));

        await this.props.fetchHenkilo(oid);
        this.props.fetchHenkiloSlaves(oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
    }

    render() {
        return <HenkiloViewPage {...this.props} view={'OPPIJA'}/>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oidHenkilo: ownProps.params['oid'],
        externalPermissionService: ownProps.location.query.permissionCheckService,
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        isAdmin: state.omattiedot.isAdmin,
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchYhteystietotyypitKoodisto,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    updateHenkiloNavigation})(OppijaViewContainer);
