import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import { l10n } from './l10n.reducer';
import { frontProperties } from './frontProperties.reducer';
import { kutsuList } from './kutsuList.reducer';
import {henkilo} from "./henkilo.reducer";
import {koodisto} from "./koodisto.reducer";
import {naviState} from "./navigation.reducer";
import {prequels} from "./prequels.reducer";
import {omattiedot} from "./omattiedot.reducer";
import {kutsuminenOrganisaatios} from './kutsuminen.reducer';
import { locale } from './locale.reducer';
import {kayttooikeus} from "./kayttooikeusryhma.reducer";
import { ryhmatState } from "./ryhmat.reducer";
import { OrganisaatioKayttooikeusryhmat } from "./organisaatiokayttooikeusryhmat.reducer";
import {organisaatio} from "./organisaatio.reducer";
import {notifications} from "./notifications.reducer";
import {haetutKayttooikeusryhmat} from "./anomus.reducer";
import {henkilohakuState} from "./henkilohaku.reducer";
import {cas} from "./cas.reducer";
import {oppijoidenTuontiYhteenveto, oppijoidenTuontiListaus} from "./oppijoidentuonti.reducer";
import {palvelutState} from "./palvelut.reducer";
import {kayttooikeusState} from "./kayttooikeus.reducer";
import {notificationList} from "./notification.reducer";

const rootReducer = combineReducers({
    routing,
    kutsuList,
    frontProperties,
    l10n,
    henkilo,
    koodisto,
    naviState,
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
    palvelutState,
    kayttooikeusState
});

export default rootReducer;
