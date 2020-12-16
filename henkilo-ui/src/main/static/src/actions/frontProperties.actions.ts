import { FETCH_FRONTPROPERTIES_REQUEST, FETCH_FRONTPROPERTIES_SUCCESS } from './actiontypes';
import frontUrls from '../henkilo-ui-virkailija-oph';
import { urls } from 'oph-urls-js';
import { fetchL10n } from './l10n.actions';
import { fetchPrequels } from './prequel.actions';
import { fetchLocale, fetchOmattiedot } from './omattiedot.actions';
import { Dispatch } from '../types/dispatch.type';
import PropertySingleton from '../globals/PropertySingleton';

const requestFrontProperties = () => ({ type: FETCH_FRONTPROPERTIES_REQUEST });
const receivedFrontProperties = () => ({
    type: FETCH_FRONTPROPERTIES_SUCCESS,
    receivedAt: Date.now(),
});
export const fetchFrontProperties = () => async (dispatch: Dispatch) => {
    dispatch(requestFrontProperties());
    urls.addProperties(frontUrls);
    urls.addCallerId(PropertySingleton.getState().opintopolkuCallerId);
    await urls.load({ overrides: '/henkilo-ui/config/frontProperties' });
    dispatch(receivedFrontProperties());
    // Fetch localisations
    dispatch(fetchL10n());
    // Do prequel requests to external services that require authentication so CAS session is opened
    await dispatch(fetchPrequels());
    // Fetch locale for current user
    dispatch(fetchLocale());
    // Fetch other info from /cas/me
    dispatch(fetchOmattiedot());
};
