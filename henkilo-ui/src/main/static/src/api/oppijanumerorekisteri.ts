import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { LOCATION_CHANGE } from 'react-router-redux';

import { getCommonOptions } from '../http';
import { addGlobalNotification } from '../actions/notification.actions';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { Localisations } from '../types/localisation.type';
import { fetchHenkilo } from '../actions/henkilo.actions';
import { FETCH_HENKILO_ASIOINTIKIELI_SUCCESS } from '../actions/actiontypes';
import { Locale } from '../types/locale.type';
import { TuontiKooste, TuontiKoosteCriteria } from '../types/tuontikooste.types';
import { Tuontidata } from '../types/tuontidata.types';
import { OppijaTuontiYhteenveto } from '../types/domain/oppijanumerorekisteri/oppijatuontiyhteenveto.types';
import { OppijoidenTuontiCriteria } from '../components/oppijoidentuonti/OppijoidenTuontiContainer';
import { Page } from '../types/Page.types';
import { OppijaList } from '../types/domain/oppijanumerorekisteri/oppijalist.types';
import { Identification } from '../types/domain/oppijanumerorekisteri/Identification.types';

type Passinumerot = string[];

export type LinkHenkilosRequest = {
    masterOid: string;
    force: boolean;
    duplicateOids: string[];
    L: Localisations;
};

const staggeredBaseQuery = retry(
    fetchBaseQuery({
        ...getCommonOptions(),
        headers: {
            ...getCommonOptions().headers,
            'Content-Type': 'application/json; charset=utf-8',
        },
        baseUrl: '/oppijanumerorekisteri-service/',
    }),
    { maxRetries: 5 }
);

export const oppijanumerorekisteriApi = createApi({
    reducerPath: 'oppijanumerorekisteriApi',
    baseQuery: staggeredBaseQuery,
    tagTypes: [
        'Passinumerot',
        'identifications',
        'locale',
        'tuontikooste',
        'tuontidata',
        'oppijoidentuontiyhteenveto',
        'oppijoidentuontilistaus',
    ],
    endpoints: (builder) => ({
        getLocale: builder.query<Locale, void>({
            query: () => ({
                url: 'henkilo/current/asiointiKieli',
                responseHandler: 'text',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                const supportedLanguages = ['fi', 'sv'];
                const lang = supportedLanguages.includes(data) ? data : 'fi';
                dispatch({ type: FETCH_HENKILO_ASIOINTIKIELI_SUCCESS, lang });
                dispatch({ type: LOCATION_CHANGE });
            },
            providesTags: ['locale'],
        }),
        getPassinumerot: builder.query<Passinumerot, string>({
            query: (oid) => `henkilo/${oid}/passinumerot`,
            providesTags: ['Passinumerot'],
        }),
        setPassinumerot: builder.mutation<Passinumerot, { oid: string; passinumerot: Passinumerot }>({
            query: ({ oid, passinumerot }) => ({
                url: `henkilo/${oid}/passinumerot`,
                method: 'POST',
                body: passinumerot,
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['Passinumerot'],
        }),
        postLinkHenkilos: builder.mutation<void, LinkHenkilosRequest>({
            query: ({ masterOid, duplicateOids, force }) => ({
                url: force ? `henkilo/${masterOid}/forcelink` : `henkilo/${masterOid}/link`,
                method: 'POST',
                body: duplicateOids,
            }),
            extraOptions: { maxRetries: 0 },
            async onQueryStarted({ L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        addGlobalNotification({
                            key: 'LINKED_DUPLICATES_SUCCESS',
                            type: NOTIFICATIONTYPES.SUCCESS,
                            title: L['DUPLIKAATIT_NOTIFICATION_ONNISTUI'],
                            autoClose: 10000,
                        })
                    );
                } catch (err) {
                    dispatch(
                        addGlobalNotification({
                            key: 'LINKED_DUPLICATES_FAILURE',
                            type: NOTIFICATIONTYPES.ERROR,
                            title: L['DUPLIKAATIT_NOTIFICATION_EPAONNISTUI'],
                            autoClose: 10000,
                        })
                    );
                }
            },
        }),
        aktivoiHenkilo: builder.mutation<void, { oidHenkilo: string; L: Localisations }>({
            query: ({ oidHenkilo }) => ({
                url: 'henkilo',
                method: 'PUT',
                body: { oidHenkilo, passivoitu: false },
                responseHandler: 'text',
            }),
            extraOptions: { maxRetries: 0 },
            async onQueryStarted({ oidHenkilo, L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(fetchHenkilo(oidHenkilo));
                } catch (err) {
                    dispatch(
                        addGlobalNotification({
                            key: 'AKTIVOI_EPAONNISTUI',
                            type: NOTIFICATIONTYPES.ERROR,
                            title: L['AKTIVOI_EPAONNISTUI'],
                            autoClose: 10000,
                        })
                    );
                }
            },
        }),
        yksiloiHetuton: builder.mutation<void, string>({
            query: (oid: string) => ({
                url: `henkilo/${oid}/yksiloihetuton`,
                method: 'POST',
            }),
            extraOptions: { maxRetries: 0 },
            async onQueryStarted(oid, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(fetchHenkilo(oid));
            },
        }),
        puraYksilointi: builder.mutation<void, string>({
            query: (oid: string) => ({
                url: `henkilo/${oid}/purayksilointi`,
                method: 'POST',
            }),
            extraOptions: { maxRetries: 0 },
            async onQueryStarted(oid, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(fetchHenkilo(oid));
            },
        }),
        passivoiHenkilo: builder.mutation<void, string>({
            query: (oid: string) => ({
                url: `henkilo/${oid}`,
                method: 'DELETE',
            }),
            extraOptions: { maxRetries: 0 },
            async onQueryStarted(oid, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(fetchHenkilo(oid));
            },
        }),
        getTuontikooste: builder.query<TuontiKooste, { L: Localisations; criteria: TuontiKoosteCriteria }>({
            query: ({ criteria }) => ({
                url: `oppija/tuontikooste?${new URLSearchParams(criteria).toString()}`,
            }),
            async onQueryStarted({ L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    dispatch(
                        addGlobalNotification({
                            key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                            title: L['KAYTTOOIKEUSRAPORTTI_ERROR'],
                            type: NOTIFICATIONTYPES.ERROR,
                            autoClose: 10000,
                        })
                    );
                }
            },
            providesTags: ['tuontikooste'],
        }),
        getTuontidata: builder.query<Tuontidata[], { L: Localisations; tuontiId: number }>({
            query: ({ tuontiId }) => ({
                url: `oppija/tuontidata/${tuontiId}`,
            }),
            async onQueryStarted({ L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    dispatch(
                        addGlobalNotification({
                            key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                            title: L['KAYTTOOIKEUSRAPORTTI_ERROR'],
                            type: NOTIFICATIONTYPES.ERROR,
                            autoClose: 10000,
                        })
                    );
                }
            },
            providesTags: ['tuontidata'],
        }),
        getOppijoidentuontiYhteenveto: builder.query<OppijaTuontiYhteenveto, void>({
            query: () => ({
                url: 'oppija/yhteenveto',
            }),
            providesTags: ['oppijoidentuontiyhteenveto'],
        }),
        getOppijoidenTuontiListaus: builder.query<Page<OppijaList>, OppijoidenTuontiCriteria>({
            query: (criteria) => ({
                url: `oppija?${new URLSearchParams(criteria).toString()}`,
            }),
            providesTags: ['oppijoidentuontilistaus'],
        }),
        getIdentifications: builder.query<Identification[], string>({
            query: (oid) => `henkilo/${oid}/identification`,
            providesTags: (_result, _error, oid) => [{ type: 'identifications', id: oid }],
        }),
        postIdentification: builder.mutation<Identification[], { oid: string; identification: Identification }>({
            query: ({ oid, identification }) => ({
                url: `henkilo/${oid}/identification`,
                method: 'POST',
                body: identification,
            }),
            invalidatesTags: (_result, _error, { oid }) => [{ type: 'identifications', id: oid }],
        }),
        deleteIdentification: builder.mutation<Identification[], { oid: string; identification: Identification }>({
            query: ({ oid, identification }) => ({
                url: `henkilo/${oid}/identification/${identification.idpEntityId}/${identification.identifier}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { oid }) => [{ type: 'identifications', id: oid }],
        }),
    }),
});

export const {
    useGetLocaleQuery,
    useGetPassinumerotQuery,
    useSetPassinumerotMutation,
    usePostLinkHenkilosMutation,
    useAktivoiHenkiloMutation,
    useYksiloiHetutonMutation,
    usePuraYksilointiMutation,
    usePassivoiHenkiloMutation,
    useGetTuontikoosteQuery,
    useGetTuontidataQuery,
    useGetOppijoidentuontiYhteenvetoQuery,
    useGetOppijoidenTuontiListausQuery,
    useGetIdentificationsQuery,
    usePostIdentificationMutation,
    useDeleteIdentificationMutation,
} = oppijanumerorekisteriApi;
