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
import {
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
} from '../../../actions/koodisto.actions';
import type { HenkiloState } from '../../../reducers/henkilo.reducer';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
import type { Localisations } from '../../../types/localisation.type';
import { RouteType } from '../../../routes';

type OwnProps = {
    params: { oid?: string };
    route: RouteType;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    L: Localisations;
};

type DispatchProps = {
    fetchHenkilo: (arg0: string) => void;
    fetchKayttaja: (arg0: string) => void;
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
        const oidHenkilo = this.props.params.oid;
        this.props.fetchHenkilo(oidHenkilo);
        this.props.fetchKayttaja(oidHenkilo);
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchMaatJaValtiotKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchHenkiloMaster(oidHenkilo);
        this.props.fetchHenkiloDuplicates(oidHenkilo);
        this.props.fetchHenkiloHakemukset(oidHenkilo);
    }

    render() {
        const henkiloType = this.props.route.henkiloType;
        return <DuplikaatitPage L={this.props.L} henkiloType={henkiloType} henkilo={this.props.henkilo} />;
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchHenkilo,
    fetchKayttaja,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
})(VirkailijaDuplikaatitContainer);
