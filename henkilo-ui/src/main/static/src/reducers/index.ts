import l10n from './l10n.reducer';
import { henkilo } from './henkilo.reducer';
import koodisto from './koodisto.reducer';
import { prequels } from './prequels.reducer';
import omattiedot from './omattiedot.reducer';
import { locale } from './locale.reducer';
import { kayttooikeus } from './kayttooikeusryhma.reducer';
import { OrganisaatioKayttooikeusryhmat } from './organisaatiokayttooikeusryhmat.reducer';
import { notifications } from './notifications.reducer';
import { notificationList } from './notification.reducer';

const rootReducer = {
    l10n,
    henkilo,
    koodisto,
    prequels,
    omattiedot,
    locale,
    kayttooikeus,
    OrganisaatioKayttooikeusryhmat,
    notificationList,
    notifications,
};

export default rootReducer;
