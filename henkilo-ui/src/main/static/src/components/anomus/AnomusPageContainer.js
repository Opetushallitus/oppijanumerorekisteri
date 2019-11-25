// @flow
import React from 'react'
import {connect} from 'react-redux'
import AnomusPage from './AnomusPage'
import type {FetchHaetutKayttooikeusryhmatParameters} from './AnomusPage';
import {clearHaetutKayttooikeusryhmat, fetchHaetutKayttooikeusryhmat} from '../../actions/anomus.actions'
import {fetchAllOrganisaatios, fetchAllRyhmas} from '../../actions/organisaatio.actions'
import {updateHaettuKayttooikeusryhmaInAnomukset, clearHaettuKayttooikeusryhma} from '../../actions/kayttooikeusryhma.actions'
import PropertySingleton from '../../globals/PropertySingleton'
import {fetchOmattiedotOrganisaatios} from '../../actions/omattiedot.actions'
import { addGlobalNotification } from "../../actions/notification.actions";
import type {L10n} from '../../types/localisation.type';
import type {Locale} from '../../types/locale.type';
import type {OrganisaatioCache} from '../../reducers/organisaatio.reducer';
import type {HaettuKayttooikeusryhma} from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types'
import type {GlobalNotificationConfig} from '../../types/notification.types';
import type {OrganisaatioCriteria} from '../../types/domain/organisaatio/organisaatio.types';

type OwnProps = {
}

type Props = {
    ...OwnProps,
    l10n: L10n,
    locale: Locale,
    kayttooikeusAnomus: Array<HaettuKayttooikeusryhma>,
    kayttooikeusAnomusLoading: boolean,
    organisaatioCache: OrganisaatioCache,
    haetutKayttooikeusryhmatLoading: boolean,
    rootOrganisaatioOid: string,
    isAdmin: boolean,
    fetchHaetutKayttooikeusryhmat: (FetchHaetutKayttooikeusryhmatParameters) => void,
    fetchAllOrganisaatios: (criteria?: OrganisaatioCriteria) => void,
    fetchAllRyhmas: () => void,
    updateHaettuKayttooikeusryhmaInAnomukset: (number, string, string, string, ?string) => Promise<any>,
    clearHaettuKayttooikeusryhma: (number) => void,
    clearHaetutKayttooikeusryhmat: () => void,
    fetchOmattiedotOrganisaatios: () => void,
    addGlobalNotification: (GlobalNotificationConfig) => void,
}

class AnomusPageContainer extends React.Component<Props> {
    render() {
        const L = this.props.l10n[this.props.locale];
        return (
          <div className="wrapper">
            <span className="oph-h2 oph-bold">{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</span>
            <AnomusPage {...this.props}/>
          </div>
        );
    };
}

const mapStateToProps = (state) => {
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

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    fetchHaetutKayttooikeusryhmat,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    updateHaettuKayttooikeusryhmaInAnomukset,
    clearHaettuKayttooikeusryhma,
    clearHaetutKayttooikeusryhmat,
    fetchOmattiedotOrganisaatios,
    addGlobalNotification
})(AnomusPageContainer);
