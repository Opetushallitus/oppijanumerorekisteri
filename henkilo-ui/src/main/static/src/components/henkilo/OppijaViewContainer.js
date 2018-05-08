// @flow

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
import type {Navigation} from "../../actions/navigation.actions";
import type {Tab} from "../../types/tab.types";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {L10n} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {KoodistoState} from "../../reducers/koodisto.reducer";

type Props = {
    oidHenkilo: string,
    henkilo: HenkiloState,
    fetchHenkiloSlaves: (oid: string) => void,
    fetchHenkilo: (oid: string) => void,
    fetchYhteystietotyypitKoodisto: () => void,
    fetchKieliKoodisto: () => void,
    fetchKansalaisuusKoodisto: () => void,
    updateHenkiloNavigation: (Array<Tab>) => Navigation,
    externalPermissionService?: string,
    koodisto: KoodistoState,
    l10n: L10n,
    locale: Locale
}

class OppijaViewContainer extends React.Component<Props> {
    async componentDidMount() {
        if (this.props.externalPermissionService) {
            PropertySingleton.setState({externalPermissionService: this.props.externalPermissionService});
        }
        await this.fetchOppijaViewData(this.props.oidHenkilo);
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
        return <HenkiloViewPage {...this.props} kayttooikeus={[]} organisaatioCache={{}} view={'OPPIJA'}/>;
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
