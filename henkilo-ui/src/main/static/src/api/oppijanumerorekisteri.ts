import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCommonOptions } from '../http';

type Passinumerot = string[];

export const oppijanumerorekisteriApi = createApi({
    reducerPath: 'oppijanumerorekisteriApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: { ...getCommonOptions().headers, 'Content-Type': 'application/json; charset=utf-8' },
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
    }),
});

export const { useGetPassinumerotQuery, useSetPassinumerotMutation } = oppijanumerorekisteriApi;
