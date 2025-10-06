import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from '../http';

export type Localisation = {
    accesscount: number;
    id: number;
    category: string;
    key: string;
    accessed: number;
    created: number;
    createdBy: string;
    modified: number;
    modifiedBy: string;
    force: boolean;
    locale: string;
    value: string;
};

const staggeredBaseQuery = retry(
    fetchBaseQuery({
        ...getCommonOptions(),
        headers: {
            ...getCommonOptions().headers,
            'Content-Type': 'application/json; charset=utf-8',
        },
        baseUrl: '/lokalisointi/',
    }),
    { maxRetries: 5 }
);

export const lokalisointiApi = createApi({
    reducerPath: 'lokalisointiApi',
    baseQuery: staggeredBaseQuery,
    tagTypes: ['localisations'],
    endpoints: (builder) => ({
        getLocalisations: builder.query<Localisation[], string>({
            query: (category) => `cxf/rest/v1/localisation?category=${category}`,
        }),
    }),
});

export const { useGetLocalisationsQuery } = lokalisointiApi;
