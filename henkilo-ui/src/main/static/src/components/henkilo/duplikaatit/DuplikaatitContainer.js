
import VirkailijaDuplikaatitPage from './DuplikaatitPage';
import React from 'react';
import {connect} from 'react-redux';
import {fetchHenkilo, fetchHenkiloDuplicates, fetchHenkiloMaster, linkHenkilos} from '../../../actions/henkilo.actions';
import {fetchOmattiedot} from '../../../actions/omattiedot.actions';
import { fetchMaatJaValtiotKoodisto, fetchKieliKoodisto } from '../../../actions/koodisto.actions';
import {updateHenkiloNavigation} from "../../../actions/navigation.actions";
import {removeNotification} from "../../../actions/notifications.actions";
import {henkiloViewTabs} from "../../navigation/NavigationTabs";

class VirkailijaDuplikaatitContainer extends React.Component {

    static propTypes = {  };

    async componentDidMount() {
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedot();
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.fetchMaatJaValtiotKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.updateHenkiloNavigation(henkiloViewTabs(this.props.oidHenkilo, this.props.henkilo, this.props.henkiloType));
    }

    render() {
        return <VirkailijaDuplikaatitPage {...this.props} />
    }

}

const mapStateToProps = (state, ownProps) => ({
    oidHenkilo: ownProps.params['oid'],
    henkiloType: ownProps.params['henkiloType'],
    l10n: state.l10n.localisations,
    locale: state.locale,
    omattiedot: state.omattiedot,
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    notifications: state.notifications.duplicatesNotifications,
});

export default connect(mapStateToProps, {fetchHenkilo, fetchOmattiedot, fetchHenkiloDuplicates, fetchHenkiloMaster,
    fetchMaatJaValtiotKoodisto, fetchKieliKoodisto, linkHenkilos, updateHenkiloNavigation, removeNotification})(VirkailijaDuplikaatitContainer);