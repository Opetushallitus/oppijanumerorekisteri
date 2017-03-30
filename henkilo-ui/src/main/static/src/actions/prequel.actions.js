import {FETCH_PREQUEL_REQUEST, FETCH_PREQUEL_SUCCESS} from "./actiontypes";
import {http} from "../http";
import {urls} from 'oph-urls-js';

const requestKayttooikeusPrequel = () => ({type: FETCH_PREQUEL_REQUEST});
const receivedKayttooikeusPrequel = (json) => ({type: FETCH_PREQUEL_SUCCESS, data: json});
const requestOppijanumerorekisteriPrequel = () => ({type: FETCH_PREQUEL_REQUEST});
const receiveOppijanumerorekisteriPrequel= (json) => ({type: FETCH_PREQUEL_SUCCESS, data: json});

export const fetchPrequels = () => (dispatch) => {
    dispatch(requestOppijanumerorekisteriPrequel());
    http.get(urls.url('oppijanumerorekisteri-service.prequel'))
        .then(json => dispatch(receiveOppijanumerorekisteriPrequel(json)));
    dispatch(requestKayttooikeusPrequel());
    http.get(urls.url('kayttooikeus-service.prequel'))
        .then(json => dispatch(receivedKayttooikeusPrequel(json)));
};

