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
        if (this.props.externalPermissionService) {
            PropertySingleton.setState({externalPermissionService: this.props.externalPermissionService});
        }
        await this.fetchOppijaViewData(this.props.oid);
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchOppijaViewData(nextProps.oidHenkilo);
        }
    }

    async fetchOppijaViewData(oid) {
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

const mapStateToProps = (state) => {
    return {
        henkilo: state.henkilo,
        koodisto: state.koodisto,
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchYhteystietotyypitKoodisto,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    updateHenkiloNavigation})(OppijaViewContainer);
