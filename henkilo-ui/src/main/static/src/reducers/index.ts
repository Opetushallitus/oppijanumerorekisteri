import { routerReducer as routing } from 'react-router-redux';

import l10n from './l10n.reducer';
import { henkilo } from './henkilo.reducer';
import koodisto from './koodisto.reducer';
import { prequels } from './prequels.reducer';
import omattiedot from './omattiedot.reducer';
import { locale } from './locale.reducer';
import { kayttooikeus } from './kayttooikeusryhma.reducer';
import { OrganisaatioKayttooikeusryhmat } from './organisaatiokayttooikeusryhmat.reducer';
import { organisaatio } from './organisaatio.reducer';
import { notifications } from './notifications.reducer';
import { henkilohakuState } from './henkilohaku.reducer';
import { notificationList } from './notification.reducer';
import existinceCheckReducer from './existence.reducer';
import createPersonReducer from './create.reducer';

const rootReducer = {
    routing,
    l10n,
    henkilo,
    koodisto,
    prequels,
    omattiedot,
    locale,
    kayttooikeus,
    OrganisaatioKayttooikeusryhmat,
    organisaatio,
    notificationList,
    notifications,
    henkilohakuState,
    existenceCheck: existinceCheckReducer,
    createPerson: createPersonReducer,
};

export default rootReducer;
