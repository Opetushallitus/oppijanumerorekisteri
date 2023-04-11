import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import HenkiloViewPage from '../../components/henkilo/HenkiloViewPage';
import {
    fetchKayttaja,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttajatieto,
    clearHenkilo,
    fetchHenkiloSlaves,
    fetchHenkiloYksilointitieto,
} from '../../actions/henkilo.actions';
import {
    fetchKansalaisuusKoodisto,
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto,
} from '../../actions/koodisto.actions';
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
    getGrantablePrivileges,
    updateHaettuKayttooikeusryhma,
} from '../../actions/kayttooikeusryhma.actions';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { OrganisaatioCache } from '../../reducers/organisaatio.reducer';
import { KoodistoState } from '../../reducers/koodisto.reducer';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';

type OwnProps = {
    oidHenkilo: string;
};

type StateProps = {
    henkilo: HenkiloState;
    organisaatioCache: OrganisaatioCache;
    koodisto: KoodistoState;
    l10n: L10n;
    locale: Locale;
    kayttooikeus: KayttooikeusRyhmaState;
};

type DispatchProps = {
    clearHenkilo: () => void;
    fetchHenkilo: (arg0: string) => void;
    fetchHenkiloOrgs: (arg0: string) => void;
    fetchHenkiloSlaves: (arg0: string) => void;
    fetchKieliKoodisto: () => void;
    fetchKansalaisuusKoodisto: () => void;
    fetchKayttaja: (arg0: string) => void;
    fetchKayttajatieto: (arg0: string) => void;
    fetchYhteystietotyypitKoodisto: () => void;
    fetchAllKayttooikeusryhmasForHenkilo: (arg0: string) => void;
    fetchAllKayttooikeusAnomusForHenkilo: (arg0: string) => void;
    fetchHenkiloYksilointitieto: (arg0: string) => void;
    updateHaettuKayttooikeusryhma: (
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
        oidHenkilo: { oid: string },
        hylkaysperuste: string
    ) => void;
    getGrantablePrivileges: (arg0: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class VirkailijaViewContainer extends React.Component<Props> {
    async componentDidMount() {
        this.props.clearHenkilo();

        await this.fetchVirkailijaViewData(this.props.oidHenkilo);
    }

    async componentWillReceiveProps(nextProps: Props) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchVirkailijaViewData(nextProps.oidHenkilo);
        }
    }

    async fetchVirkailijaViewData(oid: string) {
        await this.props.fetchHenkilo(oid);
        this.props.fetchHenkiloYksilointitieto(oid);
        this.props.fetchHenkiloOrgs(oid);
        this.props.fetchHenkiloSlaves(oid);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchKayttaja(oid);
        this.props.fetchKayttajatieto(oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(oid);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
        this.props.getGrantablePrivileges(oid);
    }

    render() {
        return <HenkiloViewPage {...this.props} view="VIRKAILIJA" />;
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchHenkiloOrgs,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchYhteystietotyypitKoodisto,
    fetchKayttaja,
    fetchKayttajatieto,
    fetchHenkiloYksilointitieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    getGrantablePrivileges,
    clearHenkilo,
})(VirkailijaViewContainer);
