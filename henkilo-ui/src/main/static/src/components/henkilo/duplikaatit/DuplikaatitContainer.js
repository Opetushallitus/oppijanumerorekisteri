
import VirkailijaDuplikaatitPage from './DuplikaatitPage';
import React from 'react';
import {connect} from 'react-redux';
import {fetchHenkilo, fetchHenkiloDuplicates, linkHenkilos} from '../../../actions/henkilo.actions';
import {fetchOmattiedot} from '../../../actions/omattiedot.actions';
import { fetchMaatJaValtiotKoodisto, fetchKieliKoodisto } from '../../../actions/koodisto.actions';

class VirkailijaDuplikaatitContainer extends React.Component {

    static propTypes = {  };

    async componentDidMount() {
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedot();
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.fetchMaatJaValtiotKoodisto();
        this.props.fetchKieliKoodisto();
    }

    render() {
        return <VirkailijaDuplikaatitPage {...this.props}></VirkailijaDuplikaatitPage>
    }

}

const mapStateToProps = (state, ownProps) => ({
    oidHenkilo: ownProps.params['oid'],
    l10n: state.l10n.localisations,
    locale: state.locale,
    omattiedot: state.omattiedot,
    henkilo: state.henkilo,
    koodisto: state.koodisto
});

export default connect(mapStateToProps, {fetchHenkilo, fetchOmattiedot, fetchHenkiloDuplicates,
    fetchMaatJaValtiotKoodisto, fetchKieliKoodisto, linkHenkilos})(VirkailijaDuplikaatitContainer);