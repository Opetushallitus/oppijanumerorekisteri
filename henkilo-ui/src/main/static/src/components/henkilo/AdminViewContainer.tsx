import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import {
    fetchKayttaja,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttajatieto,
    fetchHenkiloSlaves,
    clearHenkilo,
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
    updateHaettuKayttooikeusryhma,
} from '../../actions/kayttooikeusryhma.actions';
import HenkiloViewPage from './HenkiloViewPage';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { KoodistoState } from '../../reducers/koodisto.reducer';
import { NotificationsState } from '../../reducers/notifications.reducer';
import { OrganisaatioCache } from '../../reducers/organisaatio.reducer';
import { KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';

type OwnProps = {
    oidHenkilo: string; // tarkasteltava
    henkiloType: string;
    router: any;
};

type StateProps = {
    henkilo: HenkiloState;
    kayttooikeus: KayttooikeusRyhmaState;
    koodisto: KoodistoState;
    organisaatioCache: OrganisaatioCache;
    notifications: NotificationsState;
    l10n: L10n;
    locale: Locale;
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
};

type Props = OwnProps & StateProps & DispatchProps;
class AdminViewContainer extends React.Component<Props> {
    async componentDidMount() {
        await this.fetchHenkiloViewData(this.props.oidHenkilo);
    }

    async componentWillReceiveProps(nextProps: Props) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchHenkiloViewData(nextProps.oidHenkilo);
        }
    }

    async fetchHenkiloViewData(oid: string) {
        this.props.clearHenkilo();
        await this.props.fetchHenkilo(oid);
        this.props.fetchHenkiloOrgs(oid);
        this.props.fetchHenkiloSlaves(oid);
        this.props.fetchHenkiloYksilointitieto(oid);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchKayttaja(oid);
        this.props.fetchKayttajatieto(oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(oid);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
    }

    render() {
        return <HenkiloViewPage {...this.props} view="ADMIN" />;
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    kayttooikeus: state.kayttooikeus,
    organisaatioCache: state.organisaatio.cached,
    notifications: state.notifications,
    l10n: state.l10n.localisations,
    locale: state.locale,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchHenkilo,
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
    fetchHenkiloSlaves,
    clearHenkilo,
})(AdminViewContainer);
