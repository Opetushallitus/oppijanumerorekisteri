import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../reducers';
import AnomusPage, { FetchHaetutKayttooikeusryhmatParameters } from './AnomusPage';
import { clearHaetutKayttooikeusryhmat, fetchHaetutKayttooikeusryhmat } from '../../actions/anomus.actions';
import { fetchAllOrganisaatios, fetchAllRyhmas } from '../../actions/organisaatio.actions';
import {
    updateHaettuKayttooikeusryhmaInAnomukset,
    clearHaettuKayttooikeusryhma,
} from '../../actions/kayttooikeusryhma.actions';
import PropertySingleton from '../../globals/PropertySingleton';
import { fetchOmattiedotOrganisaatios } from '../../actions/omattiedot.actions';
import { addGlobalNotification } from '../../actions/notification.actions';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { OrganisaatioCache } from '../../reducers/organisaatio.reducer';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { GlobalNotificationConfig } from '../../types/notification.types';
import { OrganisaatioCriteria } from '../../types/domain/organisaatio/organisaatio.types';

type StateProps = {
    l10n: L10n;
    locale: Locale;
    kayttooikeusAnomus: Array<HaettuKayttooikeusryhma>;
    kayttooikeusAnomusLoading: boolean;
    organisaatioCache: OrganisaatioCache;
    haetutKayttooikeusryhmatLoading: boolean;
    rootOrganisaatioOid: string;
    isAdmin: boolean;
};

type DispatchProps = {
    fetchHaetutKayttooikeusryhmat: (arg0: FetchHaetutKayttooikeusryhmatParameters) => void;
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void;
    fetchAllRyhmas: () => void;
    updateHaettuKayttooikeusryhmaInAnomukset: (
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
        hylkaysperuste: string
    ) => void;
    clearHaettuKayttooikeusryhma: (arg0: number) => void;
    clearHaetutKayttooikeusryhmat: () => void;
    fetchOmattiedotOrganisaatios: () => void;
    addGlobalNotification: (arg0: GlobalNotificationConfig) => void;
};

type Props = StateProps & DispatchProps;
class AnomusPageContainer extends React.Component<Props> {
    render() {
        const L = this.props.l10n[this.props.locale];
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</span>
                <AnomusPage {...this.props} />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        kayttooikeusAnomus: state.haetutKayttooikeusryhmat.data,
        kayttooikeusAnomusLoading: state.haetutKayttooikeusryhmat.isLoading,
        organisaatioCache: state.organisaatio.cached,
        haetutKayttooikeusryhmatLoading: state.haetutKayttooikeusryhmat.isLoading,
        rootOrganisaatioOid: PropertySingleton.getState().rootOrganisaatioOid,
        isAdmin: state.omattiedot.isAdmin,
    };
};

export default connect<StateProps, DispatchProps, undefined, RootState>(mapStateToProps, {
    fetchHaetutKayttooikeusryhmat,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    updateHaettuKayttooikeusryhmaInAnomukset,
    clearHaettuKayttooikeusryhma,
    clearHaetutKayttooikeusryhmat,
    fetchOmattiedotOrganisaatios,
    addGlobalNotification,
})(AnomusPageContainer);
