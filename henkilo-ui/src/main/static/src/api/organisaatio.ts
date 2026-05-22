import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from './common';
import { OpenApiDocument } from '../types/openapi.types';

export const organisaatioApi = createApi({
    reducerPath: 'organisaatioApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: { ...getCommonOptions().headers, 'Content-Type': 'application/json; charset=utf-8' },
        baseUrl: '/organisaatio-service/',
    }),
    endpoints: (builder) => ({
        getOrganisaatioApiDocs: builder.query<OpenApiDocument, void>({
            query: () => 'api-docs',
        }),
    }),
});

export const { useGetOrganisaatioApiDocsQuery } = organisaatioApi;
