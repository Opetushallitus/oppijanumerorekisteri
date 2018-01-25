// @flow

import {
    FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILO_FAILURE, FETCH_HENKILOORGS_REQUEST,
    FETCH_HENKILOORGS_SUCCESS, FETCH_KAYTTAJATIETO_FAILURE, FETCH_KAYTTAJATIETO_REQUEST, FETCH_KAYTTAJATIETO_SUCCESS,
    FETCH_HENKILO_ORGANISAATIOS_REQUEST, FETCH_HENKILO_ORGANISAATIOS_SUCCESS,
    UPDATE_KAYTTAJATIETO_REQUEST, UPDATE_KAYTTAJATIETO_SUCCESS, UPDATE_KAYTTAJATIETO_FAILURE, UPDATE_HENKILO_REQUEST,
    FETCH_HENKILO_SLAVES_REQUEST, FETCH_HENKILO_SLAVES_SUCCESS, FETCH_HENKILO_SLAVES_FAILURE,
    UPDATE_HENKILO_UNLINK_REQUEST, UPDATE_HENKILO_UNLINK_SUCCESS, UPDATE_HENKILO_UNLINK_FAILURE,
    FETCH_HENKILO_DUPLICATES_REQUEST, FETCH_HENKILO_DUPLICATES_SUCCESS, FETCH_HENKILO_DUPLICATES_FAILURE,
    LINK_HENKILOS_REQUEST, LINK_HENKILOS_SUCCESS, LINK_HENKILOS_FAILURE, FETCH_HENKILO_MASTER_REQUEST,
    FETCH_HENKILO_MASTER_SUCCESS, FETCH_HENKILO_MASTER_FAILURE, CLEAR_HENKILO, UPDATE_HENKILO_FAILURE,
    FETCH_HENKILO_YKSILOINTITIETO_REQUEST, FETCH_HENKILO_YKSILOINTITIETO_SUCCESS, FETCH_HENKILO_YKSILOINTITIETO_FAILURE,
    FETCH_HENKILO_HAKEMUKSET,

} from "../actions/actiontypes";
import StaticUtils from '../components/common/StaticUtils'
import * as R from 'ramda';
import type {Henkilo} from "../types/domain/oppijanumerorekisteri/henkilo.types";
import type {KayttajatiedotRead} from "../types/domain/kayttooikeus/KayttajatiedotRead";
import type {HenkiloDuplicate} from "../types/domain/oppijanumerorekisteri/HenkiloDuplicate";
import type {Hakemus} from "../types/domain/oppijanumerorekisteri/Hakemus.type";

export type HenkiloState = {
    +henkiloLoading: boolean,
    +henkiloOrgsLoading: boolean,
    +kayttajatietoLoading: boolean,
    +henkiloKayttoEstetty: boolean,
    +henkilo: Henkilo | any,
    +henkiloOrgs: Array<any>,
    +kayttajatieto: KayttajatiedotRead | any,
    +buttonNotifications: any,
    +notifications: Array<any>,
    +henkiloOrganisaatiosLoading: boolean,
    +henkiloOrganisaatios: Array<any>,
    +slaves: Array<any>,
    +slavesLoading: boolean,
    +unlinkingLoading: boolean,
    +duplicates: Array<HenkiloDuplicate>,
    +ataruApplications: any,
    +duplicatesLoading: boolean,
    +linkingLoading: boolean,
    +masterLoading: boolean,
    +master: any,
    +yksilointitiedotLoading: boolean,
    +yksilointitiedot: Array<any>,
    +hakemuksetLoading: boolean,
    +hakemukset: Array<Hakemus>
}

const initialState: HenkiloState = {
    henkiloLoading: true,
    henkiloOrgsLoading: true,
    kayttajatietoLoading: false,
    henkiloKayttoEstetty: false,
    henkilo: {},
    henkiloOrgs: [],
    kayttajatieto: {},
    buttonNotifications: {},
    notifications: [],
    henkiloOrganisaatiosLoading: true,
    henkiloOrganisaatios: [],
    slaves: [],
    slavesLoading: false,
    unlinkingLoading: false,
    duplicates: [],
    duplicatesLoading: false,
    linkingLoading: false,
    masterLoading: true,
    master: {},
    yksilointitiedotLoading: false,
    yksilointitiedot: [],
    hakemuksetLoading: false,
    hakemukset: []
};

const mapOrgHenkilosWithOrganisations = (henkiloOrgs, organisations) => {
    return henkiloOrgs.map(henkiloOrg =>
        Object.assign({}, henkiloOrg, organisations[henkiloOrg.organisaatioOid] || StaticUtils.defaultOrganisaatio(henkiloOrg.organisaatioOid)));
};

const isKayttoEstetty = (data: ?Object | ?string) => (data && data.status === 403)
    // oppijanumerorekisteri palauttaa väärän status-koodin
    || isKayttoEstettyOppijanumerorekisteri(data)

const isKayttoEstettyOppijanumerorekisteri = (data: ?Object | ?string) => {
    if (typeof data === 'object' && data !== null) {
        const { status, path, message } = data
        return status === 401
            && path && path.startsWith('/oppijanumerorekisteri-service/')
            && message && message.endsWith('AccessDeniedException') !== -1
    }
    return false
}

export const henkilo = (state: HenkiloState = initialState, action: any): HenkiloState => {

    switch (action.type) {
        case UPDATE_HENKILO_REQUEST:
        case FETCH_HENKILO_REQUEST:
            return Object.assign({}, state, {henkiloLoading: true});
        case FETCH_HENKILO_SUCCESS:
            return Object.assign({}, state, {henkiloLoading: false, henkilo: action.henkilo});
        case FETCH_HENKILO_FAILURE:
            return {...state, henkiloLoading: false, henkiloKayttoEstetty: isKayttoEstetty(action.data)};
        case UPDATE_HENKILO_FAILURE:
            return Object.assign({}, state, {henkiloLoading: false});
        case FETCH_KAYTTAJATIETO_REQUEST:
            return Object.assign({}, state, {kayttajatietoLoading: true});
        case FETCH_KAYTTAJATIETO_SUCCESS:
        case FETCH_KAYTTAJATIETO_FAILURE:
            return Object.assign({}, state, {kayttajatietoLoading: false, kayttajatieto: action.kayttajatieto});
        case UPDATE_KAYTTAJATIETO_REQUEST:
            return Object.assign({}, state, {kayttajatietoLoading: true});
        case UPDATE_KAYTTAJATIETO_SUCCESS:
        case UPDATE_KAYTTAJATIETO_FAILURE:
            return Object.assign({}, state, {kayttatietoLoading: false, kayttajatieto: action.kayttajatieto});
        case FETCH_HENKILOORGS_REQUEST:
            return Object.assign({}, state, {henkiloOrgsLoading: true});
        case FETCH_HENKILOORGS_SUCCESS:
            return Object.assign({}, state, {
                henkiloOrgsLoading: false,
                henkiloOrgs: mapOrgHenkilosWithOrganisations(action.henkiloOrgs, action.organisations),
            });
        case FETCH_HENKILO_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { henkiloOrganisaatiosLoading: true});
        case FETCH_HENKILO_ORGANISAATIOS_SUCCESS:
            return Object.assign({}, state, {
                henkiloOrganisaatiosLoading: false,
                henkiloOrganisaatios: action.henkiloOrganisaatios
            });
        case FETCH_HENKILO_MASTER_REQUEST:
            return Object.assign({}, state, {masterLoading: true,});
        case FETCH_HENKILO_MASTER_SUCCESS:
            return Object.assign({}, state, {masterLoading: false, master: action.master,});
        case FETCH_HENKILO_MASTER_FAILURE:
            return Object.assign({}, state, {masterLoading: false,});
        case FETCH_HENKILO_SLAVES_REQUEST:
            return Object.assign({}, state, {slavesLoading: true});
        case FETCH_HENKILO_SLAVES_SUCCESS:
            return Object.assign({}, state, {slavesLoading: false, slaves: action.slaves });
        case FETCH_HENKILO_SLAVES_FAILURE:
            return Object.assign({}, state, {slavesLoading: false, slaves: []});
        case UPDATE_HENKILO_UNLINK_REQUEST:
            return Object.assign({}, state, {unlinkingLoading: true});
        case UPDATE_HENKILO_UNLINK_SUCCESS:
            const slaves = R.filter( slave => slave.oidHenkilo !== action.unlinkedSlaveOid, state.slaves);
            return Object.assign({}, state, {unlinkingLoading: false, slaves});
        case UPDATE_HENKILO_UNLINK_FAILURE:
            return Object.assign({}, state, {unlinkingLoading: false});
        case FETCH_HENKILO_DUPLICATES_REQUEST:
            return Object.assign({}, state, {duplicatesLoading: true});
        case FETCH_HENKILO_DUPLICATES_SUCCESS:
            return Object.assign({}, state, {duplicatesLoading: false, duplicates: action.duplicates});
        case FETCH_HENKILO_DUPLICATES_FAILURE:
            return Object.assign({}, state, {duplicatesLoading: false});
        case LINK_HENKILOS_REQUEST:
            return Object.assign({}, state, {linkingLoading: true});
        case LINK_HENKILOS_SUCCESS:
            return Object.assign({}, state, {linkingLoading: false});
        case LINK_HENKILOS_FAILURE:
            return Object.assign({}, state, {linkingLoading: false});
        case FETCH_HENKILO_HAKEMUKSET.REQUEST:
            return {...state, hakemuksetLoading: true};
        case FETCH_HENKILO_HAKEMUKSET.SUCCESS:
            return {...state, hakemuksetLoading: false, hakemukset: action.hakemukset};
        case FETCH_HENKILO_HAKEMUKSET.FAILURE:
            return {...state, hakemuksetLoading: false};
        case FETCH_HENKILO_YKSILOINTITIETO_REQUEST:
            return {...state,  yksilointitiedotLoading: true};
        case FETCH_HENKILO_YKSILOINTITIETO_SUCCESS:
            return {...state, yksilointitiedot: action.payload, yksilointitiedotLoading: false};
        case FETCH_HENKILO_YKSILOINTITIETO_FAILURE:
            return {...state, yksilointitiedotLoading: false};
        case CLEAR_HENKILO:
            return Object.assign({}, state, {...initialState});
        default:
            return state;
    }
};
