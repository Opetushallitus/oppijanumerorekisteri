import { createApi, fetchBaseQuery, FetchBaseQueryMeta, retry } from '@reduxjs/toolkit/query/react';

import { getCommonOptions, isApiError } from './common';
import { Localisations } from '../types/localisation.type';
import { Locale } from '../types/locale.type';
import { TuontiKooste, TuontiKoosteCriteria } from '../types/tuontikooste.types';
import { Tuontidata } from '../types/tuontidata.types';
import { OppijaTuontiYhteenveto } from '../types/domain/oppijanumerorekisteri/oppijatuontiyhteenveto.types';
import { OppijoidenTuontiCriteria } from '../components/oppijoidentuonti/OppijoidenTuontiContainer';
import { Page } from '../types/Page.types';
import { OppijaList } from '../types/domain/oppijanumerorekisteri/oppijalist.types';
import { Identification } from '../types/domain/oppijanumerorekisteri/Identification.types';
import { add } from '../slices/toastSlice';
import { Henkilo, HenkiloCreate, LinkedHenkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloDuplicate } from '../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import { Yksilointitieto } from '../types/domain/oppijanumerorekisteri/yksilointitieto.types';
import { kayttooikeusApi } from './kayttooikeus';
import { Hakemus } from '../types/domain/oppijanumerorekisteri/Hakemus.type';

type Passinumerot = string[];

export type LinkHenkilosRequest = {
    masterOid: string;
    force: boolean;
    duplicateOids: string[];
    L: Localisations;
};

export type CreateHenkiloRequest = {
    hetu: string;
    etunimet: string;
    kutsumanimi: string;
    sukunimi: string;
};

export type OppijahakuCriteria = {
    query: string;
    passive: boolean;
    page: number;
};

type OppijahakuResult = {
    oid: string;
    etunimet: string;
    sukunimi: string;
    syntymaaika: string;
};

export type SpringPageModel = {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

type SpringPage<T> = {
    content: T[];
    page: SpringPageModel;
};

type GetDuplicatesRequest = {
    etunimet?: string;
    kutsumanimi?: string;
    sukunimi?: string;
    syntymaaika?: string;
};

type GetHenkiloResponse = Henkilo & { henkiloKayttoEstetty: boolean };

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

const isKayttoEstetty = (meta?: FetchBaseQueryMeta) => meta?.response?.status === 403 || meta?.response?.status === 401;

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
        'henkilo',
        'oppijahaku',
        'master',
        'slaves',
        'duplicates',
        'hakemukset',
    ],
    endpoints: (builder) => ({
        getOnrPrequel: builder.query<void, void>({
            query: () => ({
                url: 'cas/prequel',
                responseHandler: 'text',
            }),
        }),
        getHenkilo: builder.query<GetHenkiloResponse, string>({
            query: (oid) => `henkilo/${oid}`,
            providesTags: ['henkilo'],
            transformResponse: (data: Henkilo) => {
                return { ...data, henkiloKayttoEstetty: false };
            },
            transformErrorResponse: (_data, meta) => {
                return { henkiloKayttoEstetty: isKayttoEstetty(meta) };
            },
            extraOptions: { maxRetries: 0 }, // valid api responses include status codes 401 and 403
        }),
        postOppijahaku: builder.query<SpringPage<OppijahakuResult>, OppijahakuCriteria>({
            query: (body) => ({
                url: 'internal/oppijahaku',
                method: 'POST',
                body,
            }),
            providesTags: ['oppijahaku'],
        }),
        getLocale: builder.query<Locale, void>({
            query: () => ({
                url: 'henkilo/current/asiointiKieli',
                responseHandler: 'text',
            }),
            providesTags: ['locale'],
        }),
        deleteAccess: builder.mutation<void, string>({
            query: (oid) => ({
                url: `henkilo/${oid}/access`,
                method: 'DELETE',
            }),
            async onQueryStarted(_oid, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(
                    kayttooikeusApi.util.invalidateTags([
                        'henkilonkayttooikeusryhmat',
                        'henkiloorganisaatiot',
                        'kayttajatiedot',
                    ])
                );
            },
            invalidatesTags: ['henkilo'],
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
            invalidatesTags: (_result, _error, { masterOid }) => [
                { type: 'master', id: masterOid },
                { type: 'slaves', id: masterOid },
            ],
            async onQueryStarted({ masterOid, L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        add({
                            id: `link-${masterOid}-${Math.random()}`,
                            header: L['DUPLIKAATIT_NOTIFICATION_ONNISTUI'],
                            type: 'ok',
                        })
                    );
                } catch (_err) {
                    dispatch(
                        add({
                            id: `link-${masterOid}-${Math.random()}`,
                            header: L['DUPLIKAATIT_NOTIFICATION_EPAONNISTUI'],
                            type: 'error',
                        })
                    );
                }
            },
        }),
        putYliajaTiedotVtj: builder.mutation<void, string>({
            query: (oid) => ({
                url: `henkilo/${oid}/yksilointitiedot`,
                method: 'PUT',
            }),
            invalidatesTags: ['henkilo'],
        }),
        putYliajaYksiloimaton: builder.mutation<void, string>({
            query: (oid) => ({
                url: `henkilo/${oid}/yksilointitiedot/yliajayksiloimaton`,
                method: 'PUT',
            }),
            invalidatesTags: ['henkilo'],
        }),
        updateHenkilo: builder.mutation<void, Partial<Henkilo>>({
            query: (henkilo) => ({
                url: 'henkilo',
                method: 'PUT',
                body: henkilo,
                responseHandler: 'text',
            }),
            extraOptions: { maxRetries: 1 },
            invalidatesTags: ['henkilo', 'locale'],
        }),
        aktivoiHenkilo: builder.mutation<void, { oidHenkilo: string; L: Localisations }>({
            query: ({ oidHenkilo }) => ({
                url: 'henkilo',
                method: 'PUT',
                body: { oidHenkilo, passivoitu: false },
                responseHandler: 'text',
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['henkilo'],
            async onQueryStarted({ oidHenkilo, L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (_err) {
                    dispatch(
                        add({
                            id: `aktivoi-${oidHenkilo}-${Math.random()}`,
                            header: L['AKTIVOI_EPAONNISTUI'],
                            type: 'error',
                        })
                    );
                }
            },
        }),
        getYksilointitiedot: builder.query<Yksilointitieto, string>({
            query: (oid: string) => `henkilo/${oid}/yksilointitiedot`,
        }),
        yksiloiHetuton: builder.mutation<void, string>({
            query: (oid: string) => ({
                url: `henkilo/${oid}/yksiloihetuton`,
                method: 'POST',
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['henkilo', 'master', 'slaves'],
        }),
        puraYksilointi: builder.mutation<void, string>({
            query: (oid: string) => ({
                url: `henkilo/${oid}/purayksilointi`,
                method: 'POST',
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['henkilo'],
        }),
        passivoiHenkilo: builder.mutation<void, string>({
            query: (oid: string) => ({
                url: `henkilo/${oid}`,
                method: 'DELETE',
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['henkilo'],
        }),
        getTuontikooste: builder.query<TuontiKooste, { L: Localisations; criteria: TuontiKoosteCriteria }>({
            query: ({ criteria }) => ({
                url: `oppija/tuontikooste?${new URLSearchParams(criteria).toString()}`,
            }),
            async onQueryStarted({ L }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (_err) {
                    dispatch(
                        add({
                            id: `tuontikooste-${Math.random()}`,
                            header: L['KAYTTOOIKEUSRAPORTTI_ERROR'],
                            type: 'error',
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
                } catch (_err) {
                    dispatch(
                        add({
                            id: `tuontidata-${Math.random()}`,
                            header: L['KAYTTOOIKEUSRAPORTTI_ERROR'],
                            type: 'error',
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
                url: `internal/oppijoidentuonti/virheet?${new URLSearchParams(criteria).toString()}`,
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
        createHenkilo: builder.mutation<string, CreateHenkiloRequest>({
            query: (request) => ({
                url: 'henkilo',
                method: 'POST',
                body: request,
                responseHandler: 'text',
            }),
            invalidatesTags: ['henkilo'],
        }),
        henkiloExists: builder.mutation<{ oid: string; status?: number }, CreateHenkiloRequest>({
            query: (request) => ({
                url: 'henkilo/exists',
                method: 'POST',
                body: request,
            }),
            transformResponse: (data: { oid: string }, meta) => {
                return { ...data, status: meta?.response?.status };
            },
            transformErrorResponse: (_data, meta) => {
                return { status: meta?.response?.status };
            },
            extraOptions: { maxRetries: 0 }, // valid api responses include status codes 400 and 409
        }),
        getHenkiloMaster: builder.query<LinkedHenkilo, string>({
            query: (oid) => `henkilo/${oid}/master`,
            providesTags: (_result, _error, oid) => [{ type: 'master', id: oid }],
        }),
        getHenkiloSlaves: builder.query<LinkedHenkilo[], string>({
            query: (oid) => `henkilo/${oid}/slaves`,
            providesTags: (_result, _error, oid) => [{ type: 'slaves', id: oid }],
        }),
        unlinkHenkilo: builder.mutation<void, { masterOid: string; slaveOid: string }>({
            query: ({ masterOid, slaveOid }) => ({
                url: `henkilo/${masterOid}/unlink/${slaveOid}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { masterOid, slaveOid }) => [
                { type: 'master', id: masterOid },
                { type: 'master', id: slaveOid },
                { type: 'slaves', id: masterOid },
                { type: 'slaves', id: slaveOid },
                'henkilo',
            ],
        }),
        getHenkiloDuplicates: builder.query<HenkiloDuplicate[], { oid: string; L: Localisations }>({
            query: ({ oid }) => `henkilo/${oid}/duplicates`,
            providesTags: (_result, _error, { oid }) => [{ type: 'duplicates', id: oid }],
            async onQueryStarted({ L, oid }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    let errorMessage = L['NOTIFICATION_DUPLIKAATIT_VIRHE'] + ' ' + oid;
                    if (isApiError(error)) {
                        if (
                            error.data.message.startsWith('Failed to read response from ataru') ||
                            error.data.message.startsWith('Failed to fetch applications from ataru')
                        ) {
                            errorMessage = L['NOTIFICATION_DUPLIKAATIT_HAKEMUKSET_ATARU_VIRHE'] + ' ' + oid;
                        } else if (error.data.message.startsWith('Failed fetching hakemuksetDto for henkilos')) {
                            errorMessage = L['NOTIFICATION_DUPLIKAATIT_HAKEMUKSET_HAKUAPP_VIRHE'] + ' ' + oid;
                        }
                    }
                    dispatch(
                        add({
                            id: `tuontidata-${Math.random()}`,
                            header: errorMessage,
                            type: 'error',
                        })
                    );
                }
            },
        }),
        getDuplicates: builder.query<HenkiloDuplicate[], GetDuplicatesRequest>({
            query: (request) => `henkilo/duplikaatit?${new URLSearchParams(request).toString()}`,
            providesTags: ['duplicates'],
        }),
        createOppija: builder.mutation<string, HenkiloCreate>({
            query: (body) => ({
                url: 'oppija',
                method: 'POST',
                body,
                responseHandler: 'text',
            }),
            invalidatesTags: ['henkilo', 'duplicates'],
        }),
        getHakemukset: builder.query<Hakemus[], { oid: string; L: Localisations }>({
            query: ({ oid }) => `henkilo/${oid}/hakemukset`,
            extraOptions: { maxRetries: 1 },
            providesTags: (_result, _error, { oid }) => [{ type: 'hakemukset', id: oid }],
            async onQueryStarted({ L, oid }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    let errorMessage = L['NOTIFICATION_HENKILO_HAKEMUKSET_VIRHE'] + ' ' + oid;
                    if (isApiError(error)) {
                        if (
                            error.data.message.startsWith('Failed to read response from ataru') ||
                            error.data.message.startsWith('Failed to fetch applications from ataru')
                        ) {
                            errorMessage = L['NOTIFICATION_HENKILO_HAKEMUKSET_ATARU_VIRHE'] + ' ' + oid;
                        } else if (error.data.message.startsWith('Failed fetching hakemuksetDto for henkilos')) {
                            errorMessage = L['NOTIFICATION_HENKILO_HAKEMUKSET_HAKUAPP_VIRHE'] + ' ' + oid;
                        }
                    }
                    dispatch(
                        add({
                            id: `hakemukset-${Math.random()}`,
                            type: 'error',
                            header: errorMessage,
                        })
                    );
                }
            },
        }),
    }),
});

export const {
    useGetOnrPrequelQuery,
    useGetHenkiloQuery,
    usePostOppijahakuQuery,
    useDeleteAccessMutation,
    useGetLocaleQuery,
    useGetPassinumerotQuery,
    useSetPassinumerotMutation,
    usePostLinkHenkilosMutation,
    useUpdateHenkiloMutation,
    useAktivoiHenkiloMutation,
    useYksiloiHetutonMutation,
    usePutYliajaTiedotVtjMutation,
    usePutYliajaYksiloimatonMutation,
    usePuraYksilointiMutation,
    usePassivoiHenkiloMutation,
    useGetTuontikoosteQuery,
    useGetTuontidataQuery,
    useGetOppijoidentuontiYhteenvetoQuery,
    useGetOppijoidenTuontiListausQuery,
    useGetIdentificationsQuery,
    usePostIdentificationMutation,
    useDeleteIdentificationMutation,
    useCreateHenkiloMutation,
    useHenkiloExistsMutation,
    useGetHenkiloMasterQuery,
    useGetHenkiloSlavesQuery,
    useUnlinkHenkiloMutation,
    useGetHenkiloDuplicatesQuery,
    useGetYksilointitiedotQuery,
    useGetHakemuksetQuery,
    useCreateOppijaMutation,
    useLazyGetDuplicatesQuery,
} = oppijanumerorekisteriApi;
