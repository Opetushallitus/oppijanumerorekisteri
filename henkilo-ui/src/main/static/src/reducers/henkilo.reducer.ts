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
import type { Henkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import type { KayttajatiedotRead } from '../types/domain/kayttooikeus/KayttajatiedotRead';
import type { HenkiloDuplicate } from '../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import type { Hakemus } from '../types/domain/oppijanumerorekisteri/Hakemus.type';
import type { Kayttaja } from '../types/domain/kayttooikeus/kayttaja.types';
import type { Yksilointitieto } from '../types/domain/oppijanumerorekisteri/yksilointitieto.types';

export type HenkiloState = {
    readonly henkiloLoading: boolean;
    readonly kayttajaLoading: boolean;
    readonly henkiloOrgsLoading: boolean;
    readonly kayttajatietoLoading: boolean;
    readonly henkiloKayttoEstetty: boolean;
    readonly henkilo: Henkilo;
    readonly kayttaja: Kayttaja;
    readonly henkiloOrgs: Array<any>;
    readonly kayttajatieto?: KayttajatiedotRead;
    readonly slaves: Array<any>;
    readonly duplicates: Array<HenkiloDuplicate>;
    readonly duplicatesLoading: boolean;
    readonly masterLoading: boolean;
    readonly master: any;
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
    master: {},
    yksilointitiedotLoading: false,
    yksilointitiedot: {},
    hakemuksetLoading: false,
    hakemukset: [],
};

const mapOrgHenkilosWithOrganisations = (henkiloOrgs, organisations) => {
    return henkiloOrgs.map((henkiloOrg) =>
        Object.assign(
            {},
            henkiloOrg,
            organisations[henkiloOrg.organisaatioOid] || StaticUtils.defaultOrganisaatio(henkiloOrg.organisaatioOid)
        )
    );
};

const isKayttoEstetty = (data?: { status: number; path: string; message: string }) =>
    data?.status === 403 || // oppijanumerorekisteri palauttaa väärän status-koodin
    isKayttoEstettyOppijanumerorekisteri(data);

const isKayttoEstettyOppijanumerorekisteri = (data?: { status: number; path: string; message: string }) => {
    console.log(data);
    if (typeof data === 'object' && data !== null) {
        const { status, path } = data;
        return status === 401 && path?.startsWith('/oppijanumerorekisteri-service/');
    }
    return false;
};

export const henkilo = (state: HenkiloState = initialState, action: any): HenkiloState => {
    switch (action.type) {
        case UPDATE_HENKILO_REQUEST:
        case FETCH_HENKILO_REQUEST:
            return Object.assign({}, state, { henkiloLoading: true });
        case FETCH_HENKILO_SUCCESS:
            return Object.assign({}, state, {
                henkiloLoading: false,
                henkilo: action.henkilo,
            });
        case FETCH_HENKILO_FAILURE:
            return {
                ...state,
                henkiloLoading: false,
                henkiloKayttoEstetty: isKayttoEstetty(action.data),
            };
        case UPDATE_HENKILO_FAILURE:
            return Object.assign({}, state, { henkiloLoading: false });
        case FETCH_KAYTTAJA_REQUEST:
            return { ...state, kayttajaLoading: true };
        case FETCH_KAYTTAJA_FAILURE:
            return { ...state, kayttajaLoading: false };
        case FETCH_KAYTTAJA_SUCCESS:
            return { ...state, kayttajaLoading: false, kayttaja: action.kayttaja };
        case FETCH_KAYTTAJATIETO_REQUEST:
            return Object.assign({}, state, { kayttajatietoLoading: true });
        case FETCH_KAYTTAJATIETO_SUCCESS:
        case FETCH_KAYTTAJATIETO_FAILURE:
            return Object.assign({}, state, {
                kayttajatietoLoading: false,
                kayttajatieto: action.kayttajatieto,
            });
        case UPDATE_KAYTTAJATIETO_REQUEST:
            return Object.assign({}, state, { kayttajatietoLoading: true });
        case UPDATE_KAYTTAJATIETO_SUCCESS:
            return Object.assign({}, state, {
                kayttatietoLoading: false,
                kayttajatieto: action.kayttajatieto,
            });
        case UPDATE_KAYTTAJATIETO_FAILURE:
            return {
                ...state,
                kayttajatietoLoading: false,
                kayttajatieto: state.kayttajatieto,
            };
        case FETCH_HENKILOORGS_REQUEST:
            return Object.assign({}, state, { henkiloOrgsLoading: true });
        case FETCH_HENKILOORGS_SUCCESS:
            return Object.assign({}, state, {
                henkiloOrgsLoading: false,
                henkiloOrgs: mapOrgHenkilosWithOrganisations(action.henkiloOrgs, action.organisations),
            });
        case FETCH_HENKILO_MASTER_REQUEST:
            return Object.assign({}, state, { masterLoading: true });
        case FETCH_HENKILO_MASTER_SUCCESS:
            return Object.assign({}, state, {
                masterLoading: false,
                master: action.master,
            });
        case FETCH_HENKILO_MASTER_FAILURE:
            return Object.assign({}, state, { masterLoading: false });
        case FETCH_HENKILO_SLAVES_SUCCESS:
            return Object.assign({}, state, { slaves: action.slaves });
        case FETCH_HENKILO_SLAVES_FAILURE:
            return Object.assign({}, state, { slaves: [] });
        case UPDATE_HENKILO_UNLINK_SUCCESS: {
            const slaves = state.slaves.filter((slave) => slave.oidHenkilo !== action.unlinkedSlaveOid);
            return Object.assign({}, state, { slaves });
        }
        case FETCH_HENKILO_DUPLICATES_REQUEST:
            return Object.assign({}, state, { duplicatesLoading: true });
        case FETCH_HENKILO_DUPLICATES_SUCCESS:
            return Object.assign({}, state, {
                duplicatesLoading: false,
                duplicates: action.duplicates,
            });
        case FETCH_HENKILO_DUPLICATES_FAILURE:
            return Object.assign({}, state, { duplicatesLoading: false });
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
            return Object.assign({}, state, { ...initialState });
        default:
            return state;
    }
};
