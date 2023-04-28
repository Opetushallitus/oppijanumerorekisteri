import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from '../http';
import { addGlobalNotification } from '../actions/notification.actions';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { Localisations } from '../types/localisation.type';

type Passinumerot = string[];

type LinkHenkilosRequest = {
    masterOid: string;
    force: boolean;
    duplicateOids: string[];
    L: Localisations;
};

export const oppijanumerorekisteriApi = createApi({
    reducerPath: 'oppijanumerorekisteriApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: {
            ...getCommonOptions().headers,
            'Content-Type': 'application/json; charset=utf-8',
        },
        baseUrl: '/oppijanumerorekisteri-service/',
    }),
    tagTypes: ['Passinumerot'],
    endpoints: (builder) => ({
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
            invalidatesTags: ['Passinumerot'],
        }),
        postLinkHenkilos: builder.mutation<void, LinkHenkilosRequest>({
            query: ({ masterOid, duplicateOids, force }) => ({
                url: force ? `henkilo/${masterOid}/forcelink` : `henkilo/${masterOid}/link`,
                method: 'POST',
                body: duplicateOids,
            }),
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
    }),
});

export const {
    useGetPassinumerotQuery,
    useSetPassinumerotMutation,
    usePostLinkHenkilosMutation,
} = oppijanumerorekisteriApi;
