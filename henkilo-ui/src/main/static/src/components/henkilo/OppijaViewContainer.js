// @flow

import React from 'react'
import {connect} from 'react-redux';
import {fetchHenkilo, fetchHenkiloSlaves, fetchHenkiloYksilointitieto} from "../../actions/henkilo.actions";
import {
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";

import PropertySingleton from '../../globals/PropertySingleton'
import HenkiloViewPage from "./HenkiloViewPage";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {L10n} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {KoodistoState} from "../../reducers/koodisto.reducer";
import {getEmptyKayttooikeusRyhmaState} from "../../reducers/kayttooikeusryhma.reducer";

type Props = {
    oidHenkilo: string,
    henkilo: HenkiloState,
    fetchHenkiloSlaves: (oid: string) => void,
    fetchHenkilo: (oid: string) => void,
    fetchYhteystietotyypitKoodisto: () => void,
    fetchKieliKoodisto: () => void,
    fetchHenkiloYksilointitieto: (string) => void,
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
        await this.props.fetchHenkilo(oid);
        this.props.fetchHenkiloYksilointitieto(oid);
        this.props.fetchHenkiloSlaves(oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
    }

    render() {
        return <HenkiloViewPage {...this.props} kayttooikeus={getEmptyKayttooikeusRyhmaState()} organisaatioCache={{}} view={'OPPIJA'}/>;
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
    fetchHenkiloYksilointitieto,
    fetchKieliKoodisto,
})(OppijaViewContainer);
