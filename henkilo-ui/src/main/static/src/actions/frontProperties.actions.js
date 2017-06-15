import {FETCH_FRONTPROPERTIES_REQUEST, FETCH_FRONTPROPERTIES_SUCCESS} from './actiontypes';
import frontUrls from '../henkilo-ui-virkailija-oph';
import {urls} from 'oph-urls-js';
import {fetchL10n} from './l10n.actions';
import {fetchPrequels} from "./prequel.actions";
import {fetchOmattiedot} from "./omattiedot.actions";

const requestFrontProperties = () => ({type: FETCH_FRONTPROPERTIES_REQUEST});
const receivedFrontProperties = () => ({
    type: FETCH_FRONTPROPERTIES_SUCCESS,
    receivedAt: Date.now()
});
export const fetchFrontProperties = () => (dispatch) => {
    dispatch(requestFrontProperties());
    urls.addProperties(frontUrls);
    return urls.load({overrides: '/henkilo-ui/config/frontProperties',})
        .then(() => {
            dispatch(receivedFrontProperties());
            // Fetch localisations
            dispatch(fetchL10n());
            // Fetch locale and other info from /cas/me
            dispatch(fetchOmattiedot());
            // Do prequel requests to external services that require authentication so CAS session is opened
            dispatch(fetchPrequels());
        });
};
