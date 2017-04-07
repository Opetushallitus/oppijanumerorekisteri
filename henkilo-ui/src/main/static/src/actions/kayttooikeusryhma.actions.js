import http from '../http';
import {
    FETCH_KAYTTOOIKEUSRYHMA_FOR_HENKILO_IN_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_HENKILO_IN_ORGANISAATIO_FAILURE
} from './actiontypes';

const requestKayttooikeusryhmaForHenkiloInOrganisaatio = (henkiloOid, organisaatioOid) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_FOR_HENKILO_IN_ORGANISAATIO_REQUEST,
    henkiloOid,
    organisaatioOid
});
const receiveKayttooikeusryhmaForHenkiloInOrganisaatioSuccess = (kayttooikeusryhmat) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS,
    kayttooikeusryhmat
});
const receiveKayttooikeusryhmaForHenkiloInOrganisaatioFailure = (error) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_FOR_HENKILO_IN_ORGANISAATIO_FAILURE,
    error
});

export const fetchKayttooikeusryhmaForHenkiloInOrganisaatio = async ( henkiloOid, organisaatioOid ) => {
    dispatch(requestKayttooikeusryhmaForHenkiloInOrganisaatio);
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.forHenkilo.inOrganisaatio', henkiloOid, organisaatioOid);
    try {
        const kayttooikeusryhma = await http.get(url);
        dispatch(receiveKayttooikeusryhmaForHenkiloInOrganisaatioSuccess(kayttooikeusryhma));
    } catch(error) {
        dispatch(receiveKayttooikeusryhmaForHenkiloInOrganisaatioFailure(error));
        console.error(error);
    }
};