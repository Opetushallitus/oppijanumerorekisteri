import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE,
} from './actiontypes';

const requestAllKayttooikeusryhmasForHenkilo = (henkiloOid) => ({type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST, henkiloOid});
const receiveAllKayttooikeusryhmasForHenkilo = (henkiloOid, kayttooikeus) => ({type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    henkiloOid, kayttooikeus});
const errorAllKayttooikeusryhmasForHenkilo = (henkiloOid) => ({type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE, henkiloOid});
export const fetchAllKayttooikeusryhmasForHenkilo = henkiloOid => dispatch => {
    dispatch(requestAllKayttooikeusryhmasForHenkilo(henkiloOid));
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.henkilo.oid', henkiloOid);
    http.get(url)
        .then(kayttooikeus => {dispatch(receiveAllKayttooikeusryhmasForHenkilo(henkiloOid, kayttooikeus))})
        .catch(() => dispatch(errorAllKayttooikeusryhmasForHenkilo(henkiloOid)));
};
