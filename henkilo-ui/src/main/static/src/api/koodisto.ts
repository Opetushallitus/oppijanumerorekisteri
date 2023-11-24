import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from '../http';
import { Koodisto } from '../types/domain/koodisto/koodisto.types';

export const koodistoApi = createApi({
    reducerPath: 'koodistoApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: { ...getCommonOptions().headers, 'Content-Type': 'application/json; charset=utf-8' },
        baseUrl: '/koodisto-service/',
    }),
    tagTypes: ['henkilotunnistetyypit'],
    endpoints: (builder) => ({
        getHenkilontunnistetyypit: builder.query<Koodisto, void>({
            query: () => 'rest/json/henkilontunnistetyypit/koodi',
        }),
    }),
});

export const { useGetHenkilontunnistetyypitQuery } = koodistoApi;
