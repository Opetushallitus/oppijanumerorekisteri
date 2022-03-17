import { FETCH_LOCALISATIONS_REQUEST, FETCH_LOCALISATIONS_SUCCESS } from './actiontypes';
import { http } from '../http';
import { urls } from 'oph-urls-js';
import { L10n } from '../types/localisation.type';

const mapLocalisationsByLocale = (localisations: Array<any>): L10n => {
    const result = { fi: {}, sv: {}, en: {} };
    localisations.forEach((localisation: any) => {
        try {
            result[localisation.locale][localisation.key] = localisation.value;
        } catch {
            // nop, survive malformed data from localization service
        }
    });
    return result;
};

const requestLocalisations = () => ({ type: FETCH_LOCALISATIONS_REQUEST });
const receiveLocalisations = (payload: any) => ({
    type: FETCH_LOCALISATIONS_SUCCESS,
    localisations: payload,
});

type Localisation = {
    accesscount: number;
    id: number;
    category: string;
    key: string;
    accessed: number;
    created: number;
    createdBy: string;
    modified: number;
    modifiedBy: string;
    force: boolean;
    locale: string;
    value: string;
};

export const fetchL10n = () => async (dispatch: any) => {
    dispatch(requestLocalisations());

    const henkiloUiLocalisations = await http.get(urls.url('henkilo-ui.l10n'));
    dispatch(receiveLocalisations(henkiloUiLocalisations));

    const localisationPalveluLocalisations = await http.get<Localisation[]>(
        urls().url('lokalisointi.localisation', { category: 'henkilo-ui' })
    );
    const localisationsByLocale = mapLocalisationsByLocale(localisationPalveluLocalisations);
    dispatch(receiveLocalisations(localisationsByLocale));
};
