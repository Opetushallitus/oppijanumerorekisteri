import { FETCH_FRONTPROPERTIES_REQUEST, FETCH_FRONTPROPERTIES_SUCCESS } from './actiontypes';
import frontUrls from '../henkilo-ui-virkailija-oph';
import { urls } from 'oph-urls-js';
import PropertySingleton from '../globals/PropertySingleton';
import { AppDispatch } from '../store';

const requestFrontProperties = () => ({ type: FETCH_FRONTPROPERTIES_REQUEST });
const receivedFrontProperties = () => ({
    type: FETCH_FRONTPROPERTIES_SUCCESS,
    receivedAt: Date.now(),
});
export const fetchFrontProperties = () => async (dispatch: AppDispatch) => {
    dispatch(requestFrontProperties());
    urls.addProperties(frontUrls);
    urls.addCallerId(PropertySingleton.getState().opintopolkuCallerId);
    await urls.load({ overrides: '/henkilo-ui/config/frontProperties' });
    dispatch(receivedFrontProperties());
};
