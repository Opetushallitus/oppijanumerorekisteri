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
import { PalvelukayttajaCriteria, PalvelukayttajaRead } from '../types/domain/kayttooikeus/palvelukayttaja.types';
import { HenkilohakuResult } from '../types/domain/kayttooikeus/HenkilohakuResult.types';
import { Henkilohaku, HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';

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
        'palvelukayttaja',
        'henkilohaku',
        'henkilohakucount',
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
            providesTags: ['palvelukayttaja'],
        }),
        getHenkiloHaku: builder.query<HenkilohakuResult[], Henkilohaku>({
            query: ({ criteria, parameters }) => ({
                url: `henkilo/henkilohaku?${new URLSearchParams(parameters).toString()}`,
                method: 'POST',
                body: { ...criteria, isCountSearch: false },
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => endpointName + JSON.stringify(queryArgs.criteria),
            merge: (currentCache, newItems) => {
                currentCache.push(...newItems);
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
    useGetHenkiloHakuQuery,
    useGetHenkiloHakuCountQuery,
} = kayttooikeusApi;
