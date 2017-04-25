import React from 'react';
import {connect} from 'react-redux';
import OmattiedotPage from './OmattiedotPage';
import { fetchOmattiedotHenkiloData } from '../../actions/omattiedot.actions';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, updateHenkiloAndRefetch, updateAndRefetchKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import { fetchSukupuoliKoodisto, fetchKieliKoodisto, fetchKansalaisuusKoodisto, fetchYhteystietotyypitKoodisto } from '../../actions/koodisto.actions';

class OmattiedotPageContainer extends React.Component {

    async componentDidMount() {
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        await this.props.fetchOmattiedotHenkiloData();
    }

    render() {
        return <OmattiedotPage {...this.props} />;
    }


}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        omattiedot: state.omattiedot,
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale
    };
};

export default connect(mapStateToProps, {fetchOmattiedotHenkiloData, fetchHenkilo, fetchHenkiloOrgs, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
    fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, updateHenkiloAndRefetch, fetchKayttajatieto, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateAndRefetchKayttajatieto})(OmattiedotPageContainer)