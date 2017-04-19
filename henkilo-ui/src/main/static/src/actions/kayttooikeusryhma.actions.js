import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE, FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS, FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_REQUEST, UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_SUCCESS,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE,
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

const requestAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    henkiloOid
});
const receiveAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid, kayttooikeusAnomus) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS,
    henkiloOid,
    kayttooikeusAnomus
});
const errorAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    henkiloOid
});
export const fetchAllKayttooikeusAnomusForHenkilo = henkiloOid => dispatch => {
    dispatch(requestAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid));
    const url = urls.url('kayttooikeus-service.henkilo.anomus-list', henkiloOid, {activeOnly: true});
    http.get(url)
        .then(kayttooikeusAnomus => {dispatch(receiveAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid, kayttooikeusAnomus))})
        .catch(() => dispatch(errorAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid)));
};

const requestHaettuKayttooikeusryhmaUpdate = (id) => ({ type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_REQUEST, id, });
const receiveHaettuKayttooikeusryhmaUpdate = (id) => ({ type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_SUCCESS, id, });
const errorHaettuKayttooikeusryhmaUpdate = (id) => ({ type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE, id });
export const updateHaettuKayttooikeusryhma = (id, kayttoOikeudenTila, alkupvm, loppupvm, oidHenkilo) => dispatch => {
    dispatch(requestHaettuKayttooikeusryhmaUpdate(id));
    const url = urls.url('kayttooikeus-service.henkilo.kaytto-oikeus-anomus');
    http.put(url, {id, kayttoOikeudenTila, alkupvm, loppupvm,})
        .then(() => {
            dispatch(receiveHaettuKayttooikeusryhmaUpdate(id));
            dispatch(fetchAllKayttooikeusAnomusForHenkilo(oidHenkilo));
        }).catch(() => dispatch(errorHaettuKayttooikeusryhmaUpdate(id)));
};

