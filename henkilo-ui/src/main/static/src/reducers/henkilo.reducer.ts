import {
    FETCH_HENKILO_REQUEST,
    FETCH_HENKILO_SUCCESS,
    FETCH_HENKILO_FAILURE,
    FETCH_HENKILOORGS_REQUEST,
    FETCH_KAYTTAJA_REQUEST,
    FETCH_KAYTTAJA_SUCCESS,
    FETCH_KAYTTAJA_FAILURE,
    FETCH_HENKILOORGS_SUCCESS,
    FETCH_KAYTTAJATIETO_FAILURE,
    FETCH_KAYTTAJATIETO_REQUEST,
    FETCH_KAYTTAJATIETO_SUCCESS,
    UPDATE_KAYTTAJATIETO_REQUEST,
    UPDATE_KAYTTAJATIETO_SUCCESS,
    UPDATE_KAYTTAJATIETO_FAILURE,
    UPDATE_HENKILO_REQUEST,
    FETCH_HENKILO_SLAVES_SUCCESS,
    FETCH_HENKILO_SLAVES_FAILURE,
    UPDATE_HENKILO_UNLINK_SUCCESS,
    FETCH_HENKILO_DUPLICATES_REQUEST,
    FETCH_HENKILO_DUPLICATES_SUCCESS,
    FETCH_HENKILO_DUPLICATES_FAILURE,
    FETCH_HENKILO_MASTER_REQUEST,
    FETCH_HENKILO_MASTER_SUCCESS,
    FETCH_HENKILO_MASTER_FAILURE,
    CLEAR_HENKILO,
    UPDATE_HENKILO_FAILURE,
    FETCH_HENKILO_YKSILOINTITIETO_REQUEST,
    FETCH_HENKILO_YKSILOINTITIETO_SUCCESS,
    FETCH_HENKILO_YKSILOINTITIETO_FAILURE,
    FETCH_HENKILO_HAKEMUKSET,
} from '../actions/actiontypes';
import StaticUtils from '../components/common/StaticUtils';
import type { Henkilo, HenkiloOrg, LinkedHenkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import type { KayttajatiedotRead } from '../types/domain/kayttooikeus/KayttajatiedotRead';
import type { HenkiloDuplicate } from '../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import type { Hakemus } from '../types/domain/oppijanumerorekisteri/Hakemus.type';
import type { Kayttaja } from '../types/domain/kayttooikeus/kayttaja.types';
import type { Yksilointitieto } from '../types/domain/oppijanumerorekisteri/yksilointitieto.types';
import { StoreOrganisaatio } from '../types/domain/organisaatio/organisaatio.types';
import { OrganisaatioCache } from './organisaatio.reducer';
import { AnyAction } from '@reduxjs/toolkit';

export type HenkiloState = {
    readonly henkiloLoading: boolean;
    readonly kayttajaLoading: boolean;
    readonly henkiloOrgsLoading: boolean;
    readonly kayttajatietoLoading: boolean;
    readonly henkiloKayttoEstetty: boolean;
    readonly henkilo: Henkilo;
    readonly kayttaja: Kayttaja;
    readonly henkiloOrgs: Array<StoreOrganisaatio>;
    readonly kayttajatieto?: KayttajatiedotRead;
    readonly slaves: Array<LinkedHenkilo>;
    readonly duplicates: Array<HenkiloDuplicate>;
    readonly duplicatesLoading: boolean;
    readonly masterLoading: boolean;
    readonly master: LinkedHenkilo;
    readonly yksilointitiedotLoading: boolean;
    readonly yksilointitiedot: Yksilointitieto;
    readonly hakemuksetLoading: boolean;
    readonly hakemukset: Array<Hakemus>;
};

const initialState: HenkiloState = {
    henkiloLoading: true,
    kayttajaLoading: false,
    henkiloOrgsLoading: true,
    kayttajatietoLoading: false,
    henkiloKayttoEstetty: false,
    henkilo: {} as Henkilo,
    kayttaja: {} as Kayttaja,
    henkiloOrgs: [],
    kayttajatieto: undefined,
    slaves: [],
    duplicates: [],
    duplicatesLoading: false,
    masterLoading: true,
    master: {} as LinkedHenkilo,
    yksilointitiedotLoading: false,
    yksilointitiedot: {},
    hakemuksetLoading: false,
    hakemukset: [],
};

const mapOrgHenkilosWithOrganisations = (
    henkiloOrgs: HenkiloOrg[],
    organisations: OrganisaatioCache
): StoreOrganisaatio[] => {
    return henkiloOrgs.map((henkiloOrg) => {
        const org =
            organisations[henkiloOrg.organisaatioOid] || StaticUtils.defaultOrganisaatio(henkiloOrg.organisaatioOid);
        return { ...henkiloOrg, ...org };
    });
};

const isKayttoEstetty = (data?: { status: number; path: string; message: string }) =>
    data?.status === 403 || // oppijanumerorekisteri palauttaa väärän status-koodin
    isKayttoEstettyOppijanumerorekisteri(data);

const isKayttoEstettyOppijanumerorekisteri = (data?: { status: number; path: string; message: string }) => {
    if (typeof data === 'object' && data !== null) {
        const { status, path } = data;
        return status === 401 && path?.startsWith('/oppijanumerorekisteri-service/');
    }
    return false;
};

export const henkilo = (state: Readonly<HenkiloState> = initialState, action: AnyAction): HenkiloState => {
    switch (action.type) {
        case UPDATE_HENKILO_REQUEST:
        case FETCH_HENKILO_REQUEST:
            return { ...state, henkiloLoading: true };
        case FETCH_HENKILO_SUCCESS:
            return { ...state, henkiloLoading: false, henkilo: action.henkilo };
        case FETCH_HENKILO_FAILURE:
            return {
                ...state,
                henkiloLoading: false,
                henkiloKayttoEstetty: isKayttoEstetty(action.data),
            };
        case UPDATE_HENKILO_FAILURE:
            return { ...state, henkiloLoading: false };
        case FETCH_KAYTTAJA_REQUEST:
            return { ...state, kayttajaLoading: true };
        case FETCH_KAYTTAJA_FAILURE:
            return { ...state, kayttajaLoading: false };
        case FETCH_KAYTTAJA_SUCCESS:
            return { ...state, kayttajaLoading: false, kayttaja: action.kayttaja };
        case FETCH_KAYTTAJATIETO_REQUEST:
            return { ...state, kayttajatietoLoading: true };
        case FETCH_KAYTTAJATIETO_SUCCESS:
        case FETCH_KAYTTAJATIETO_FAILURE:
            return { ...state, kayttajatietoLoading: false, kayttajatieto: action.kayttajatieto };
        case UPDATE_KAYTTAJATIETO_REQUEST:
            return { ...state, kayttajatietoLoading: true };
        case UPDATE_KAYTTAJATIETO_SUCCESS:
            return { ...state, kayttajatietoLoading: false, kayttajatieto: action.kayttajatieto };
        case UPDATE_KAYTTAJATIETO_FAILURE:
            return {
                ...state,
                kayttajatietoLoading: false,
                kayttajatieto: state.kayttajatieto,
            };
        case FETCH_HENKILOORGS_REQUEST:
            return { ...state, henkiloOrgsLoading: true };
        case FETCH_HENKILOORGS_SUCCESS:
            return {
                ...state,
                henkiloOrgsLoading: false,
                henkiloOrgs: mapOrgHenkilosWithOrganisations(action.henkiloOrgs, action.organisations),
            };
        case FETCH_HENKILO_MASTER_REQUEST:
            return { ...state, masterLoading: true };
        case FETCH_HENKILO_MASTER_SUCCESS:
            return { ...state, masterLoading: false, master: action.master };
        case FETCH_HENKILO_MASTER_FAILURE:
            return { ...state, masterLoading: false };
        case FETCH_HENKILO_SLAVES_SUCCESS:
            return { ...state, slaves: action.slaves };
        case FETCH_HENKILO_SLAVES_FAILURE:
            return { ...state, slaves: [] };
        case UPDATE_HENKILO_UNLINK_SUCCESS: {
            const slaves = state.slaves.filter((slave) => slave.oidHenkilo !== action.unlinkedSlaveOid);
            return { ...state, slaves };
        }
        case FETCH_HENKILO_DUPLICATES_REQUEST:
            return { ...state, duplicatesLoading: true };
        case FETCH_HENKILO_DUPLICATES_SUCCESS:
            return { ...state, duplicatesLoading: false, duplicates: action.duplicates };
        case FETCH_HENKILO_DUPLICATES_FAILURE:
            return { ...state, duplicatesLoading: false };
        case FETCH_HENKILO_HAKEMUKSET.REQUEST:
            return { ...state, hakemuksetLoading: true };
        case FETCH_HENKILO_HAKEMUKSET.SUCCESS:
            return {
                ...state,
                hakemuksetLoading: false,
                hakemukset: action.hakemukset,
            };
        case FETCH_HENKILO_HAKEMUKSET.FAILURE:
            return { ...state, hakemuksetLoading: false };
        case FETCH_HENKILO_YKSILOINTITIETO_REQUEST:
            return { ...state, yksilointitiedotLoading: true };
        case FETCH_HENKILO_YKSILOINTITIETO_SUCCESS:
            return {
                ...state,
                yksilointitiedot: action.payload,
                yksilointitiedotLoading: false,
            };
        case FETCH_HENKILO_YKSILOINTITIETO_FAILURE:
            return { ...state, yksilointitiedotLoading: false };
        case CLEAR_HENKILO:
            return { ...state, ...initialState };
        default:
            return state;
    }
};
