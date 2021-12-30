import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import l10n, { LocalisationState } from './l10n.reducer';
import { frontProperties } from './frontProperties.reducer';
import kutsuList, { KutsuListState } from './kutsuList.reducer';
import { henkilo } from './henkilo.reducer';
import koodisto, { KoodistoState } from './koodisto.reducer';
import { prequels } from './prequels.reducer';
import omattiedot, { OmattiedotState } from './omattiedot.reducer';
import { kutsuminenOrganisaatios } from './kutsuminen.reducer';
import { locale } from './locale.reducer';
import { kayttooikeus } from './kayttooikeusryhma.reducer';
import { ryhmatState } from './ryhmat.reducer';
import { OrganisaatioKayttooikeusryhmat } from './organisaatiokayttooikeusryhmat.reducer';
import { organisaatio } from './organisaatio.reducer';
import { notifications } from './notifications.reducer';
import { haetutKayttooikeusryhmat } from './anomus.reducer';
import { henkilohakuState } from './henkilohaku.reducer';
import cas, { CasState } from './cas.reducer';
import { oppijoidenTuontiYhteenveto, oppijoidenTuontiListaus } from './oppijoidentuonti.reducer';
import { palvelukayttajat } from './palvelukayttaja.reducer';
import { palvelutState } from './palvelut.reducer';
import { kayttooikeusState } from './kayttooikeus.reducer';
import { notificationList } from './notification.reducer';
import { linkitykset } from './henkiloLinkitys.reducer';
import { reportReducer, AccessRightsReportState } from './report.reducer';

export type RootState = {
    routing: unknown;
    kutsuList: KutsuListState;
    frontProperties: unknown;
    l10n: LocalisationState;
    henkilo: unknown;
    koodisto: KoodistoState;
    prequels: unknown;
    omattiedot: OmattiedotState;
    kutsuminenOrganisaatios: unknown;
    locale: string;
    kayttooikeus: unknown;
    ryhmatState: unknown;
    OrganisaatioKayttooikeusryhmat: unknown;
    organisaatio: unknown;
    notificationList: unknown;
    notifications: unknown;
    haetutKayttooikeusryhmat: unknown;
    henkilohakuState: unknown;
    cas: CasState;
    oppijoidenTuontiYhteenveto: unknown;
    oppijoidenTuontiListaus: unknown;
    palvelukayttajat: unknown;
    palvelutState: unknown;
    kayttooikeusState: unknown;
    linkitykset: unknown;
    report: AccessRightsReportState;
};

const rootReducer = combineReducers<RootState>({
    routing,
    kutsuList,
    frontProperties,
    l10n,
    henkilo,
    koodisto,
    prequels,
    omattiedot,
    kutsuminenOrganisaatios,
    locale,
    kayttooikeus,
    ryhmatState,
    OrganisaatioKayttooikeusryhmat,
    organisaatio,
    notificationList,
    notifications,
    haetutKayttooikeusryhmat,
    henkilohakuState,
    cas,
    oppijoidenTuontiYhteenveto,
    oppijoidenTuontiListaus,
    palvelukayttajat,
    palvelutState,
    kayttooikeusState,
    linkitykset,
    report: reportReducer,
});

export default rootReducer;
