import DuplikaatitPage from './DuplikaatitPage';
import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import {
    fetchHenkilo,
    fetchKayttaja,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
} from '../../../actions/henkilo.actions';
import { fetchOmattiedot } from '../../../actions/omattiedot.actions';
import {
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
} from '../../../actions/koodisto.actions';
import type { HenkiloState } from '../../../reducers/henkilo.reducer';
import PropertySingleton from '../../../globals/PropertySingleton';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
import type { Localisations } from '../../../types/localisation.type';

type OwnProps = {
    params: any;
    location: any;
    route: any;
};

type StateProps = {
    oidHenkilo: string;
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    henkiloType: string;
    externalPermissionService: string;
    L: Localisations;
};

type DispatchProps = {
    fetchHenkilo: (arg0: string) => void;
    fetchKayttaja: (arg0: string) => void;
    fetchOmattiedot: () => void;
    fetchHenkiloMaster: (arg0: string) => void;
    fetchHenkiloHakemukset: (arg0: string) => void;
    fetchHenkiloDuplicates: (arg0: string) => void;
    fetchMaatJaValtiotKoodisto: () => void;
    fetchKansalaisuusKoodisto: () => void;
    fetchKieliKoodisto: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class VirkailijaDuplikaatitContainer extends React.Component<Props> {
    async componentDidMount() {
        if (this.props.externalPermissionService) {
            PropertySingleton.setState({
                externalPermissionService: this.props.externalPermissionService,
            });
        }
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchKayttaja(this.props.oidHenkilo);
        this.props.fetchOmattiedot();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchMaatJaValtiotKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.fetchHenkiloHakemukset(this.props.oidHenkilo);
    }

    render() {
        return <DuplikaatitPage {...this.props} />;
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    oidHenkilo: ownProps.params['oid'],
    externalPermissionService: ownProps.location.query.permissionCheckService,
    henkiloType: ownProps.route['henkiloType'],
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchHenkilo,
    fetchKayttaja,
    fetchOmattiedot,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
})(VirkailijaDuplikaatitContainer);
