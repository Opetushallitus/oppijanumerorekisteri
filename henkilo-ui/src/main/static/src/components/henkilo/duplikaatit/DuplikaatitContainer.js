// @flow
import DuplikaatitPage from './DuplikaatitPage';
import React from 'react';
import {connect} from 'react-redux';
import {fetchHenkilo, fetchHenkiloDuplicates, fetchHenkiloMaster, fetchHenkiloHakemukset} from '../../../actions/henkilo.actions';
import {fetchOmattiedot} from '../../../actions/omattiedot.actions';
import {fetchKansalaisuusKoodisto,
        fetchMaatJaValtiotKoodisto,
        fetchKieliKoodisto} from '../../../actions/koodisto.actions';
import {updateHenkiloNavigation} from "../../../actions/navigation.actions";
import {removeNotification} from "../../../actions/notifications.actions";
import {henkiloViewTabs} from "../../navigation/NavigationTabs";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import type {L10n} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";
import PropertySingleton from '../../../globals/PropertySingleton';
import type {KoodistoState} from "../../../reducers/koodisto.reducer";
import type {Tab} from "../../../types/tab.types";

type Props = {
    l10n: L10n,
    locale: Locale,
    oidHenkilo: string,
    henkilo: HenkiloState,
    koodisto: KoodistoState,
    henkiloType: string,
    fetchHenkilo: string => void,
    fetchOmattiedot: () => void,
    fetchHenkiloMaster: string => void,
    fetchHenkiloHakemukset: string => void,
    fetchHenkiloDuplicates: string => void,
    fetchMaatJaValtiotKoodisto: () => void,
    fetchKansalaisuusKoodisto: () => void,
    fetchKieliKoodisto: () => void,
    updateHenkiloNavigation: (Array<Tab>) => void,
    externalPermissionService: string
}

class VirkailijaDuplikaatitContainer extends React.Component<Props> {

    async componentDidMount() {
        if (this.props.externalPermissionService) {
            PropertySingleton.setState({externalPermissionService: this.props.externalPermissionService});
        }
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedot();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchMaatJaValtiotKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.fetchHenkiloHakemukset(this.props.oidHenkilo);
        this.props.updateHenkiloNavigation(henkiloViewTabs(this.props.oidHenkilo, this.props.henkilo, this.props.henkiloType));
    }

    render() {
        return <DuplikaatitPage {...this.props} />;
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        oidHenkilo: ownProps.params['oid'],
        externalPermissionService: ownProps.location.query.permissionCheckService,
        henkiloType: ownProps.params['henkiloType'],
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
        koodisto: state.koodisto,
        notifications: state.notifications.duplicatesNotifications,
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchOmattiedot,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
    updateHenkiloNavigation,
    removeNotification
})(VirkailijaDuplikaatitContainer);
