import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from '../http';
import { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { Omattiedot } from '../types/domain/kayttooikeus/Omattiedot.types';
import {
    FETCH_HENKILO_ASIOINTIKIELI_SUCCESS,
    FETCH_HENKILO_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_SUCCESS,
} from '../actions/actiontypes';
import { Locale } from '../types/locale.type';
import { KutsuRead } from '../types/domain/kayttooikeus/Kutsu.types';
import {
    Jarjestelmatunnus,
    PalvelukayttajaCreate,
    PalvelukayttajaCriteria,
    PalvelukayttajaRead,
} from '../types/domain/kayttooikeus/palvelukayttaja.types';
import { HenkilohakuResult } from '../types/domain/kayttooikeus/HenkilohakuResult.types';
import { Henkilohaku, HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { fetchOrganisations } from '../actions/organisaatio.actions';
import { KutsututSearchParams } from '../components/kutsutut/KutsututPage';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { Palvelu } from '../types/domain/kayttooikeus/palvelu.types';
import { PalveluKayttooikeus } from '../types/domain/kayttooikeus/palvelukayttooikeus.types';
import { OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';
import { OrganisaatioNameLookup } from '../reducers/organisaatio.reducer';
import { PalveluRooli } from '../types/domain/kayttooikeus/PalveluRooli.types';
import { TextGroupModify } from '../types/domain/kayttooikeus/textgroup.types';
import { PalveluRooliModify } from '../types/domain/kayttooikeus/PalveluRooliModify.types';
import { SallitutKayttajatyypit } from '../components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import { KayttajatiedotRead } from '../types/domain/kayttooikeus/KayttajatiedotRead';

type MfaSetupResponse = {
    secretKey: string;
    qrCodeDataUri: string;
};

type MfaEnableRequest = string;
type MfaDisableRequest = void;
type MfaPostResponse = boolean;

export type AccessRightsReportRow = {
    id: number;
    personName: string;
    personOid: string;
    organisationName: string;
    organisationOid: string;
    accessRightName: string;
    accessRightId: number;
    startDate: string;
    endDate: string;
    modified: string;
    modifiedBy: string;
};

export type GetHaetutKayttooikeusryhmatRequest = {
    q?: string;
    organisaatioOids?: string;
    kayttooikeusRyhmaIds?: number[];
    orderBy: string;
    limit: string;
    showOwnAnomus: string;
    adminView: string;
    anomuksenTilat: string;
    kayttoOikeudenTilas: string;
    offset: string;
};

export type PutHaettuKayttooikeusryhmaRequest = {
    id: number;
    kayttoOikeudenTila: string;
    alkupvm: string;
    loppupvm?: string;
    hylkaysperuste?: string;
};

type PostSalasananVaihtoRequest = {
    loginToken: string;
    newPassword: string;
    currentPassword: string;
};

type KayttooikeusryhmaRequest = {
    nimi: TextGroupModify;
    kuvaus: TextGroupModify;
    palvelutRoolit: PalveluRooliModify[];
    rooliRajoite: null;
    ryhmaRestriction: boolean;
    organisaatioTyypit: string[];
    slaveIds: number[];
    sallittuKayttajatyyppi: SallitutKayttajatyypit;
};

type CasLoginRedirectParams = Record<string, string>;

export type KutsututSortBy = 'AIKALEIMA' | 'NIMI' | 'SAHKOPOSTI';
type KutsututRequest = {
    params: KutsututSearchParams;
    sortBy: KutsututSortBy;
    direction: 'ASC' | 'DESC';
    offset: string;
    amount: string;
};

export type HenkiloLinkitykset = {
    henkiloVarmentajas?: string[];
    henkiloVarmennettavas?: string[];
};

export const kayttooikeusApi = createApi({
    reducerPath: 'kayttooikeusApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: { ...getCommonOptions().headers, 'Content-Type': 'application/json; charset=utf-8' },
        baseUrl: '/kayttooikeus-service/',
    }),
    tagTypes: [
        'omattiedot',
        'omatorganisaatiot',
        'kutsuByToken',
        'accessRightReport',
        'kayttajatiedot',
        'palvelukayttaja',
        'palvelukayttajat',
        'henkilohaku',
        'henkilohakucount',
        'henkilohakuorganisaatiot',
        'henkilolinkitykset',
        'haetutKayttooikeusryhmat',
        'kutsutut',
        'allowedKayttooikeusryhmasForOrganisation',
        'palvelut',
        'palvelukayttoooikeudet',
        'kayttooikeusryhmat',
        'organisaatioryhmat',
        'rootorganisation',
        'organisationnames',
        'kayttooikeusryhmaroolit',
    ],
    endpoints: (builder) => ({
        getOmattiedot: builder.query<Omattiedot, void>({
            query: () => 'henkilo/current/omattiedot',
            async onQueryStarted(_oid, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch({ type: FETCH_OMATTIEDOT_SUCCESS, omattiedot: data });
                } catch (_err) {
                    //
                }
            },
            providesTags: ['omattiedot'],
        }),
        getOmatOrganisaatiot: builder.query<OrganisaatioHenkilo[], { oid: string; locale: Locale }>({
            query: ({ oid }) => `henkilo/${oid}/organisaatio?piilotaOikeudettomat=true`,
            async onQueryStarted({ locale }, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch({ type: FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS, organisaatios: data, locale });
            },
            providesTags: ['omatorganisaatiot'],
        }),
        getMfaSetup: builder.query<MfaSetupResponse, void>({
            query: () => 'mfasetup/gauth/setup',
            extraOptions: { maxRetries: 0 },
        }),
        postMfaEnable: builder.mutation<MfaPostResponse, MfaEnableRequest>({
            query: (token) => ({
                url: 'mfasetup/gauth/enable',
                method: 'POST',
                body: `"${token}"`,
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['omattiedot'],
        }),
        postMfaDisable: builder.mutation<MfaPostResponse, MfaDisableRequest>({
            query: () => ({
                url: 'mfasetup/gauth/disable',
                method: 'POST',
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['omattiedot'],
        }),
        getKutsuByToken: builder.query<KutsuRead, string>({
            query: (token) => `kutsu/token/${token}`,
            async onQueryStarted(_token, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch({ type: FETCH_HENKILO_ASIOINTIKIELI_SUCCESS, lang: data.asiointikieli ?? 'fi' });
                dispatch({
                    type: FETCH_HENKILO_SUCCESS,
                    henkilo: {
                        ...data,
                        etunimet: data.etunimi,
                        asiointiKieli: {
                            kieliKoodi: data.asiointikieli,
                        },
                    },
                });
            },
            providesTags: ['kutsuByToken'],
        }),
        getAccessRightReport: builder.query<AccessRightsReportRow[], string>({
            query: (oid) => `reports/accessrights/${oid}`,
            providesTags: ['accessRightReport'],
        }),
        getKayttajatiedot: builder.query<KayttajatiedotRead, string>({
            query: (oid) => `henkilo/${oid}/kayttajatiedot`,
            providesTags: ['kayttajatiedot'],
        }),
        putKayttajatiedot: builder.mutation<KayttajatiedotRead, { oid: string; username: string }>({
            query: ({ oid, username }) => ({
                url: `henkilo/${oid}/kayttajatiedot`,
                method: 'PUT',
                body: { username },
            }),
            invalidatesTags: ['kayttajatiedot'],
        }),
        getPalvelukayttajat: builder.query<PalvelukayttajaRead[], PalvelukayttajaCriteria>({
            query: (criteria) => `palvelukayttaja?${new URLSearchParams(criteria).toString()}`,
            providesTags: ['palvelukayttajat'],
        }),
        getPalvelukayttaja: builder.query<Jarjestelmatunnus, string>({
            query: (oid) => `palvelukayttaja/${oid}`,
            providesTags: ['palvelukayttaja'],
        }),
        postPalvelukayttaja: builder.mutation<PalvelukayttajaRead, PalvelukayttajaCreate>({
            query: (body) => ({
                url: 'palvelukayttaja',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['palvelukayttaja', 'palvelukayttajat'],
        }),
        putPalvelukayttajaCasPassword: builder.mutation<string, string>({
            query: (oid) => ({
                url: `palvelukayttaja/${oid}/cas`,
                method: 'PUT',
            }),
            invalidatesTags: ['palvelukayttaja', 'palvelukayttajat'],
        }),
        putPalvelukayttajaOauth2Secret: builder.mutation<string, string>({
            query: (oid) => ({
                url: `palvelukayttaja/${oid}/oauth2`,
                method: 'PUT',
            }),
            invalidatesTags: ['palvelukayttaja', 'palvelukayttajat'],
        }),
        getHenkiloHaku: builder.query<HenkilohakuResult[], Henkilohaku>({
            query: ({ criteria, parameters }) => ({
                url: `henkilo/henkilohaku?${new URLSearchParams(parameters).toString()}`,
                method: 'POST',
                body: { ...criteria, isCountSearch: false },
            }),
            // "infinite scroll" i.e. merge new results when offset is increased
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                endpointName + JSON.stringify(queryArgs.criteria) + queryArgs.parameters?.orderBy,
            merge: (currentCache, newItems) => {
                const uniqueItems = [...new Map([...currentCache, ...newItems].map((x) => [x.oidHenkilo, x])).values()];
                return uniqueItems;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                JSON.stringify(currentArg?.parameters) !== JSON.stringify(previousArg?.parameters),
            providesTags: ['henkilohaku'],
        }),
        getHenkiloHakuCount: builder.query<string, HenkilohakuCriteria>({
            query: (criteria) => ({
                url: 'henkilo/henkilohakucount',
                method: 'POST',
                body: { ...criteria, isCountSearch: true },
                responseHandler: 'text',
            }),
            providesTags: ['henkilohakucount'],
        }),
        getHaetutKayttooikeusryhmat: builder.query<HaettuKayttooikeusryhma[], GetHaetutKayttooikeusryhmatRequest>({
            query: ({ kayttooikeusRyhmaIds, ...rest }) => {
                const params = new URLSearchParams(rest);
                kayttooikeusRyhmaIds?.forEach((id) => params.append('kayttooikeusRyhmaIds', String(id)));
                return `kayttooikeusanomus/haettuKayttoOikeusRyhma?${params.toString()}`;
            },
            // "infinite scroll" i.e. merge new results when offset is increased
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                endpointName +
                queryArgs?.orderBy +
                queryArgs?.q +
                queryArgs?.organisaatioOids +
                queryArgs?.adminView +
                queryArgs?.kayttooikeusRyhmaIds?.toString(),
            merge: (currentCache, newItems) => [
                ...new Map([...currentCache, ...newItems].map((x) => [x.id, x])).values(),
            ],
            forceRefetch: ({ currentArg, previousArg }) => currentArg?.offset !== previousArg?.offset,
            async onQueryStarted(_token, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                await dispatch<any>(fetchOrganisations(data.map((h) => h.anomus.organisaatioOid)));
            },
            providesTags: ['haetutKayttooikeusryhmat'],
        }),
        putHaettuKayttooikeusryhma: builder.mutation<void, PutHaettuKayttooikeusryhmaRequest>({
            query: (body) => ({
                url: 'kayttooikeusanomus',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['haetutKayttooikeusryhmat'],
        }),
        postSalasananVaihto: builder.mutation<CasLoginRedirectParams, PostSalasananVaihtoRequest>({
            query: (body) => ({
                url: 'cas/salasananvaihto',
                method: 'POST',
                body,
            }),
        }),
        getKutsutut: builder.query<KutsuRead[], KutsututRequest>({
            query: ({ params, sortBy, direction, offset, amount }) =>
                `kutsu?${new URLSearchParams({ ...params, sortBy, direction, offset, amount }).toString()}`,
            // "infinite scroll" i.e. merge new results when offset is increased
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                endpointName + JSON.stringify(queryArgs.params) + queryArgs.sortBy + queryArgs.direction,
            merge: (currentCache, newItems) => [
                ...new Map([...currentCache, ...newItems].map((x) => [x.id, x])).values(),
            ],
            forceRefetch: ({ currentArg, previousArg }) => currentArg?.offset !== previousArg?.offset,
            providesTags: ['kutsutut'],
        }),
        deleteKutsu: builder.mutation<void, number>({
            query: (id) => ({ url: `kutsu/${id}`, method: 'DELETE' }),
            invalidatesTags: ['kutsutut'],
        }),
        putRenewKutsu: builder.mutation<void, number>({
            query: (id) => ({ url: `kutsu/${id}/renew`, method: 'PUT' }),
            invalidatesTags: ['kutsutut'],
        }),
        getHenkiloHakuOrganisaatiot: builder.query<OrganisaatioHenkilo[], string>({
            query: (oid) => `henkilo/${oid}/organisaatio?requiredRoles=HENKILOHAKU`,
            providesTags: ['henkilohakuorganisaatiot'],
        }),
        getHenkiloLinkitykset: builder.query<HenkiloLinkitykset, string>({
            query: (oid) => `henkilo/${oid}/linkitykset`,
            providesTags: ['henkilolinkitykset'],
        }),
        getAllowedKayttooikeusryhmasForOrganisation: builder.query<
            MyonnettyKayttooikeusryhma[],
            { oidHenkilo: string; oidOrganisaatio: string }
        >({
            query: ({ oidHenkilo, oidOrganisaatio }) => ({ url: `kayttooikeusryhma/${oidHenkilo}/${oidOrganisaatio}` }),
            providesTags: ['allowedKayttooikeusryhmasForOrganisation'],
        }),
        getPalvelut: builder.query<Palvelu[], void>({
            query: () => 'palvelu',
            providesTags: ['palvelut'],
        }),
        getPalveluKayttooikeudet: builder.query<PalveluKayttooikeus[], string>({
            query: (palvelu) => `kayttooikeus/${palvelu}`,
            providesTags: ['palvelukayttoooikeudet'],
        }),
        getKayttooikeusryhmas: builder.query<
            Kayttooikeusryhma[],
            { passiiviset: boolean; palvelu?: string; kayttooikeus?: string }
        >({
            query: ({ passiiviset, palvelu, kayttooikeus }) =>
                `kayttooikeusryhma?${new URLSearchParams({
                    passiiviset: String(passiiviset),
                    ...(palvelu && kayttooikeus ? { palvelu, kayttooikeus } : {}),
                }).toString()}`,
            providesTags: ['kayttooikeusryhmat'],
        }),
        getKayttooikeusryhmaRoolis: builder.query<PalveluRooli[], string>({
            query: (ryhmaId) => `kayttooikeusryhma/${ryhmaId}/kayttooikeus`,
            providesTags: ['kayttooikeusryhmaroolit'],
        }),
        postKayttooikeusryhma: builder.mutation<void, KayttooikeusryhmaRequest>({
            query: (body) => ({ url: 'kayttooikeusryhma', method: 'POST', body }),
            invalidatesTags: ['kayttooikeusryhmat', 'kayttooikeusryhmaroolit'],
        }),
        putKayttooikeusryhma: builder.mutation<void, { id: string; body: KayttooikeusryhmaRequest }>({
            query: ({ id, body }) => ({ url: `kayttooikeusryhma/${id}`, method: 'PUT', body }),
            invalidatesTags: ['kayttooikeusryhmat', 'kayttooikeusryhmaroolit'],
        }),
        getOrganisaatioRyhmat: builder.query<OrganisaatioWithChildren[], void>({
            query: () => `organisaatio?${new URLSearchParams({ tyyppi: 'RYHMA' }).toString()}`,
            providesTags: ['organisaatioryhmat'],
        }),
        getRootOrganisation: builder.query<OrganisaatioWithChildren, void>({
            query: () => {
                const params = new URLSearchParams({ tyyppi: 'ORGANISAATIO', tila: 'AKTIIVINEN' });
                params.append('tila', 'SUUNNITELTU');
                return `organisaatio/root?${params.toString()}`;
            },
            providesTags: ['rootorganisation'],
        }),
        getOrganisationNames: builder.query<OrganisaatioNameLookup, void>({
            query: () => 'organisaatio/names',
            providesTags: ['organisationnames'],
        }),
    }),
});

export const {
    useGetOmattiedotQuery,
    useGetOmatOrganisaatiotQuery,
    useGetMfaSetupQuery,
    usePostMfaEnableMutation,
    usePostMfaDisableMutation,
    useGetKutsuByTokenQuery,
    useGetAccessRightReportQuery,
    useGetKayttajatiedotQuery,
    usePutKayttajatiedotMutation,
    useGetPalvelukayttajatQuery,
    useGetPalvelukayttajaQuery,
    usePostPalvelukayttajaMutation,
    usePutPalvelukayttajaCasPasswordMutation,
    usePutPalvelukayttajaOauth2SecretMutation,
    useGetHenkiloHakuQuery,
    useGetHenkiloHakuCountQuery,
    useGetHaetutKayttooikeusryhmatQuery,
    usePutHaettuKayttooikeusryhmaMutation,
    usePostSalasananVaihtoMutation,
    useGetKutsututQuery,
    useDeleteKutsuMutation,
    usePutRenewKutsuMutation,
    useGetHenkiloHakuOrganisaatiotQuery,
    useGetHenkiloLinkityksetQuery,
    useGetAllowedKayttooikeusryhmasForOrganisationQuery,
    useGetPalvelutQuery,
    useGetPalveluKayttooikeudetQuery,
    useGetKayttooikeusryhmasQuery,
    usePutKayttooikeusryhmaMutation,
    usePostKayttooikeusryhmaMutation,
    useGetKayttooikeusryhmaRoolisQuery,
    useGetOrganisaatioRyhmatQuery,
    useGetRootOrganisationQuery,
    useGetOrganisationNamesQuery,
} = kayttooikeusApi;
