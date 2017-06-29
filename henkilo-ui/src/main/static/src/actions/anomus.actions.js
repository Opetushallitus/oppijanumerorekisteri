import {http} from '../http';
import {urls} from 'oph-urls-js';
import {fetchOrganisations} from "./organisaatio.actions";
import {FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST, FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS, FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE} from './actiontypes';

const requestHaetutKayttooikeusryhmat = () => ({type: FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST});
const receiveHaetutKayttooikeusryhmatSuccess = (json) => ({type: FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS, haetutKayttooikeusryhmat: json});
const receiveHaetutKayttooikeusryhmatFailure = () => ({type: FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE});

export const fetchHaetutKayttooikeusryhmat = (parameters) => dispatch => {
        dispatch(requestHaetutKayttooikeusryhmat());
        const url = urls.url('kayttooikeus-service.anomus.haetut-kayttooikeusryhmat', parameters);
        return http.get(url)
          .then(haetutKayttooikeusryhmat => {
              // ladataa vielä organisaatiot jotta "state.organisaatio.cached" alustetaan
              dispatch(fetchOrganisations(haetutKayttooikeusryhmat.map(haettuKayttooikeusryhma => haettuKayttooikeusryhma.anomus.organisaatioOid)))
              .then(() => dispatch(receiveHaetutKayttooikeusryhmatSuccess(haetutKayttooikeusryhmat)));
        }).catch(() => dispatch(receiveHaetutKayttooikeusryhmatFailure()));
    };
