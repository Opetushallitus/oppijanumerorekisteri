
import { http } from '../http';
import { urls } from 'oph-urls-js';

import { KUTSU_SET_ORGANISAATIO, KUTSU_ADD_ORGANISAATIO, KUTSU_REMOVE_ORGANISAATIO, KUTSU_CLEAR_ORGANISAATIOS,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_REQUEST,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_FAILURE} from './actiontypes';

export const kutsuSetOrganisaatio = (index, organisaatio) => dispatch => dispatch({type: KUTSU_SET_ORGANISAATIO, index, organisaatio});
export const kutsuAddOrganisaatio = organisaatio => dispatch => dispatch({type: KUTSU_ADD_ORGANISAATIO, organisaatio});
export const kutsuRemoveOrganisaatio = organisaatioOid => dispatch => dispatch({type: KUTSU_REMOVE_ORGANISAATIO, organisaatioOid});
export const kutsuClearOrganisaatios = () => dispatch => dispatch({type: KUTSU_CLEAR_ORGANISAATIOS});



const requestKayttooikeusryhmaForHenkiloInOrganisaatio = (henkiloOid, organisaatioOid) => ({
    type: FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_REQUEST,
    henkiloOid,
    organisaatioOid
});
const receiveKayttooikeusryhmaForHenkiloInOrganisaatioSuccess = (organisaatioOid, kayttooikeusryhmat) => ({
    type: FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS,
    kayttooikeusryhmat,
    organisaatioOid
});
const receiveKayttooikeusryhmaForHenkiloInOrganisaatioFailure = (error) => ({
    type: FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_FAILURE,
    error
});
export const fetchKutsujaKayttooikeusForHenkiloInOrganisaatio = ( henkiloOid, organisaatioOid ) => async dispatch => {
    dispatch(requestKayttooikeusryhmaForHenkiloInOrganisaatio(henkiloOid, organisaatioOid));
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.forHenkilo.inOrganisaatio', henkiloOid, organisaatioOid);
    try {
        const kayttooikeusryhma = await http.get(url);
        dispatch(receiveKayttooikeusryhmaForHenkiloInOrganisaatioSuccess(organisaatioOid, kayttooikeusryhma));
    } catch(error) {
        dispatch(receiveKayttooikeusryhmaForHenkiloInOrganisaatioFailure(error));
        console.error(`Fetching kayttooikeusryhmät for henkilo (${henkiloOid}) in organisaatio (${organisaatioOid}) failed`, error);
    }
};