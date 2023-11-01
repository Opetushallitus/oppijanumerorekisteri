import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from '../http';
import { FETCH_LOCALISATIONS_SUCCESS } from '../actions/actiontypes';
import { L10n } from '../types/localisation.type';

type Localisation = {
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

const mapLocalisationsByLocale = (localisations: Localisation[]): L10n => {
    const result = { fi: {}, sv: {}, en: {} };
    localisations.forEach((localisation) => {
        try {
            result[localisation.locale][localisation.key] = localisation.value;
        } catch {
            // nop, survive malformed data from localization service
        }
    });
    return result;
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
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                const localisations = mapLocalisationsByLocale(data);
                dispatch({ type: FETCH_LOCALISATIONS_SUCCESS, localisations });
            },
        }),
    }),
});

export const { useGetLocalisationsQuery } = lokalisointiApi;
