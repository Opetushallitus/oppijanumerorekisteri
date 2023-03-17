import { routerReducer as routing } from 'react-router-redux';

import l10n, { LocalisationState } from './l10n.reducer';
import { frontProperties, FrontPropertiesState } from './frontProperties.reducer';
import kutsuList, { KutsuListState } from './kutsuList.reducer';
import { henkilo, HenkiloState } from './henkilo.reducer';
import koodisto, { KoodistoState } from './koodisto.reducer';
import { prequels, PrequelsState } from './prequels.reducer';
import omattiedot, { OmattiedotState } from './omattiedot.reducer';
import { kutsuminenOrganisaatios, KutsuminenOrganisaatiosState } from './kutsuminen.reducer';
import { locale } from './locale.reducer';
import { kayttooikeus, KayttooikeusRyhmaState } from './kayttooikeusryhma.reducer';
import { ryhmatState, RyhmatState } from './ryhmat.reducer';
import {
    OrganisaatioKayttooikeusryhmat,
    OrganisaatioKayttooikeusryhmatState,
} from './organisaatiokayttooikeusryhmat.reducer';
import { organisaatio, OrganisaatioState } from './organisaatio.reducer';
import { notifications, NotificationsState } from './notifications.reducer';
import { haetutKayttooikeusryhmat, HaetutKayttooikeusryhmatState } from './anomus.reducer';
import { henkilohakuState, HenkilohakuState } from './henkilohaku.reducer';
import cas, { CasState } from './cas.reducer';
import {
    oppijoidenTuontiYhteenveto,
    TuontiYhteenvetoState,
    oppijoidenTuontiListaus,
    TuontiListausState,
} from './oppijoidentuonti.reducer';
import { tuontiKoosteReducer, TuontiKoosteState } from './tuontikooste.reducer';
import { tuontidataReducer, TuontidataState } from './tuontidata.reducer';
import { palvelukayttajat, PalvelukayttajatState } from './palvelukayttaja.reducer';
import { palvelutState, PalvelutState } from './palvelut.reducer';
import { kayttooikeusState, KayttooikeusState } from './kayttooikeus.reducer';
import { notificationList, NotificationListState } from './notification.reducer';
import { linkitykset, HenkiloLinkitysState } from './henkiloLinkitys.reducer';
import { reportReducer, AccessRightsReportState } from './report.reducer';
import existinceCheckReducer, { ExistenceCheckState } from './existence.reducer';
import createPersonReducer, { CreatePersonState } from './create.reducer';
import { passinumeroReducer, PassinumeroState } from './passinumero.reducer';
import { Locale } from '../types/locale.type';

export type RootState = {
    routing: any;
    kutsuList: KutsuListState;
    frontProperties: FrontPropertiesState;
    l10n: LocalisationState;
    henkilo: HenkiloState;
    koodisto: KoodistoState;
    prequels: PrequelsState;
    omattiedot: OmattiedotState;
    kutsuminenOrganisaatios: KutsuminenOrganisaatiosState;
    locale: Locale;
    kayttooikeus: KayttooikeusRyhmaState;
    ryhmatState: RyhmatState;
    OrganisaatioKayttooikeusryhmat: OrganisaatioKayttooikeusryhmatState;
    organisaatio: OrganisaatioState;
    notificationList: NotificationListState;
    notifications: NotificationsState;
    haetutKayttooikeusryhmat: HaetutKayttooikeusryhmatState;
    henkilohakuState: HenkilohakuState;
    cas: CasState;
    oppijoidenTuontiYhteenveto: TuontiYhteenvetoState;
    oppijoidenTuontiListaus: TuontiListausState;
    tuontikooste: TuontiKoosteState;
    tuontidata: TuontidataState;
    palvelukayttajat: PalvelukayttajatState;
    palvelutState: PalvelutState;
    kayttooikeusState: KayttooikeusState;
    linkitykset: HenkiloLinkitysState;
    report: AccessRightsReportState;
    existenceCheck: ExistenceCheckState;
    createPerson: CreatePersonState;
    passinumerot: PassinumeroState;
};

const rootReducer = {
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
    tuontikooste: tuontiKoosteReducer,
    tuontidata: tuontidataReducer,
    palvelukayttajat,
    palvelutState,
    kayttooikeusState,
    linkitykset,
    report: reportReducer,
    existenceCheck: existinceCheckReducer,
    createPerson: createPersonReducer,
    passinumerot: passinumeroReducer,
};

export default rootReducer;
