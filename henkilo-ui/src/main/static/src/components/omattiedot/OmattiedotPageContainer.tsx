import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import { fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo } from '../../actions/henkilo.actions';
import {
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
} from '../../actions/kayttooikeusryhma.actions';
import {
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchYhteystietotyypitKoodisto,
} from '../../actions/koodisto.actions';
import {
    fetchAllHierarchialOrganisaatios,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
} from '../../actions/organisaatio.actions';
import HenkiloViewPage from '../henkilo/HenkiloViewPage';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { L10n } from '../../types/localisation.type';
import { KoodistoState } from '../../reducers/koodisto.reducer';
import { Locale } from '../../types/locale.type';
import { KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { OrganisaatioCache, OrganisaatioState } from '../../reducers/organisaatio.reducer';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import { OrganisaatioKayttooikeusryhmatState } from '../../reducers/organisaatiokayttooikeusryhmat.reducer';
import { OrganisaatioCriteria } from '../../types/domain/organisaatio/organisaatio.types';

type OwnProps = {
    location: any;
};

type StateProps = {
    path: string;
    omattiedot: OmattiedotState;
    henkilo: HenkiloState;
    l10n: L10n;
    koodisto: KoodistoState;
    locale: Locale;
    kayttooikeus: KayttooikeusRyhmaState;
    organisaatios: OrganisaatioState;
    ryhmas: RyhmatState;
    organisaatioCache: OrganisaatioCache;
    organisaatioKayttooikeusryhmat: OrganisaatioKayttooikeusryhmatState;
    notifications: any;
};

type DispatchProps = {
    fetchOmattiedot: () => void;
    fetchHenkilo: (arg0: string) => void;
    fetchHenkiloOrgs: (arg0: string) => void;
    fetchYhteystietotyypitKoodisto: () => void;
    fetchKieliKoodisto: () => void;
    fetchKansalaisuusKoodisto: () => void;
    fetchKayttajatieto: (arg0: string) => void;
    fetchAllKayttooikeusryhmasForHenkilo: (oid?: string) => void;
    fetchAllKayttooikeusAnomusForHenkilo: (arg0: string) => void;
    updateHaettuKayttooikeusryhma: (
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
        oidHenkilo: { oid: string },
        hylkaysperuste: string
    ) => void;
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void;
    fetchAllRyhmas: () => void;
    fetchAllHierarchialOrganisaatios: () => void;
    clearHenkilo: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class OmattiedotPageContainer extends React.Component<Props> {
    async componentDidMount() {
        this.props.clearHenkilo();

        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchAllOrganisaatios();
        this.props.fetchAllRyhmas();
        this.props.fetchAllHierarchialOrganisaatios();
        await this.props.fetchOmattiedot();
        const userOid = this.props.omattiedot.data.oid;
        this.props.fetchHenkilo(userOid);
        this.props.fetchKayttajatieto(userOid);
        this.props.fetchHenkiloOrgs(userOid);
        this.props.fetchAllKayttooikeusryhmasForHenkilo(); // For current user
        this.props.fetchAllKayttooikeusAnomusForHenkilo(userOid);
    }

    render() {
        return <HenkiloViewPage {...this.props} oidHenkilo={this.props.omattiedot.data.oid} view="OMATTIEDOT" />;
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    path: ownProps.location.pathname,
    omattiedot: state.omattiedot,
    henkilo: state.henkilo,
    l10n: state.l10n.localisations,
    koodisto: state.koodisto,
    locale: state.locale,
    kayttooikeus: state.kayttooikeus,
    organisaatios: state.organisaatio,
    ryhmas: state.ryhmatState,
    organisaatioCache: state.organisaatio.cached,
    organisaatioKayttooikeusryhmat: state.OrganisaatioKayttooikeusryhmat,
    notifications: state.notifications,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchOmattiedot,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchYhteystietotyypitKoodisto,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchKayttajatieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    fetchAllHierarchialOrganisaatios,
    clearHenkilo,
})(OmattiedotPageContainer);
