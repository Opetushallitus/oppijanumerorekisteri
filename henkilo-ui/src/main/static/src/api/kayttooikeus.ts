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
    PalvelukayttajaCreate,
    PalvelukayttajaCriteria,
    PalvelukayttajaRead,
} from '../types/domain/kayttooikeus/palvelukayttaja.types';
import { HenkilohakuResult } from '../types/domain/kayttooikeus/HenkilohakuResult.types';
import { Henkilohaku, HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { fetchOrganisations } from '../actions/organisaatio.actions';

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
    loppupvm: string;
    hylkaysperuste: string;
};

type PostSalasananVaihtoRequest = {
    loginToken: string;
    newPassword: string;
    currentPassword: string;
};

type CasLoginRedirectParams = Record<string, string>;

export const kayttooikeusApi = createApi({
    reducerPath: 'kayttooikeusApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: { ...getCommonOptions().headers, 'Content-Type': 'application/json; charset=utf-8' },
        baseUrl: '/kayttooikeus-service/',
    }),
    tagTypes: [
        'omattiedot',
        'organisaatiot',
        'kutsuByToken',
        'accessRightReport',
        'palvelukayttajat',
        'henkilohaku',
        'henkilohakucount',
        'haetutKayttooikeusryhmat',
    ],
    endpoints: (builder) => ({
        getOmattiedot: builder.query<Omattiedot, void>({
            query: () => 'henkilo/current/omattiedot',
            async onQueryStarted(_oid, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch({ type: FETCH_OMATTIEDOT_SUCCESS, omattiedot: data });
            },
            providesTags: ['omattiedot'],
        }),
        getOmatOrganisaatiot: builder.query<OrganisaatioHenkilo[], { oid: string; locale: Locale }>({
            query: ({ oid }) => `henkilo/${oid}/organisaatio?piilotaOikeudettomat=true`,
            async onQueryStarted({ locale }, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch({ type: FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS, organisaatios: data, locale });
            },
            providesTags: ['organisaatiot'],
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
                dispatch({ type: FETCH_HENKILO_ASIOINTIKIELI_SUCCESS, lang: data.asiointikieli });
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
        getPalvelukayttajat: builder.query<PalvelukayttajaRead[], PalvelukayttajaCriteria>({
            query: (criteria) => `palvelukayttaja?${new URLSearchParams(criteria).toString()}`,
            providesTags: ['palvelukayttajat'],
        }),
        postPalvelukayttaja: builder.mutation<PalvelukayttajaRead, PalvelukayttajaCreate>({
            query: (body) => ({
                url: 'palvelukayttaja',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['palvelukayttajat'],
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
            query: (parameters) =>
                `kayttooikeusanomus/haettuKayttoOikeusRyhma?${new URLSearchParams(parameters).toString()}`,
            // "infinite scroll" i.e. merge new results when offset is increased
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                endpointName + queryArgs?.orderBy + queryArgs?.q + queryArgs?.organisaatioOids + queryArgs?.adminView,
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
    useGetPalvelukayttajatQuery,
    usePostPalvelukayttajaMutation,
    useGetHenkiloHakuQuery,
    useGetHenkiloHakuCountQuery,
    useGetHaetutKayttooikeusryhmatQuery,
    usePutHaettuKayttooikeusryhmaMutation,
    usePostSalasananVaihtoMutation,
} = kayttooikeusApi;
