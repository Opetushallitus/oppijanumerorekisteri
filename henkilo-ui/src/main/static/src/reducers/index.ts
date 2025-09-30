import l10n from './l10n.reducer';
import { henkilo } from './henkilo.reducer';
import { prequels } from './prequels.reducer';
import omattiedot from './omattiedot.reducer';
import { locale } from './locale.reducer';
import { notifications } from './notifications.reducer';
import { notificationList } from './notification.reducer';

const rootReducer = {
    l10n,
    henkilo,
    prequels,
    omattiedot,
    locale,
    notificationList,
    notifications,
};

export default rootReducer;
