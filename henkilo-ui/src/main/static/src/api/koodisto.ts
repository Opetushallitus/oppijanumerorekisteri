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
        getKansalaisuudet: builder.query<Koodisto, void>({
            query: () => 'rest/json/maatjavaltiot2/koodi',
        }),
        getKielet: builder.query<Koodisto, void>({
            query: () => 'rest/json/kieli/koodi',
        }),
        getOppilaitostyypit: builder.query<Koodisto, void>({
            query: () => 'rest/codeelement/codes/oppilaitostyyppi/1',
        }),
        getOrganisaatiotyypit: builder.query<Koodisto, void>({
            query: () => 'rest/codeelement/codes/organisaatiotyyppi/3',
        }),
        getSukupuolet: builder.query<Koodisto, void>({
            query: () => 'rest/json/sukupuoli/koodi',
        }),
        getYhteystietotyypit: builder.query<Koodisto, void>({
            query: () => 'rest/json/yhteystietotyypit/koodi',
        }),
    }),
});

export const {
    useGetHenkilontunnistetyypitQuery,
    useGetKansalaisuudetQuery,
    useGetKieletQuery,
    useGetOppilaitostyypitQuery,
    useGetOrganisaatiotyypitQuery,
    useGetSukupuoletQuery,
    useGetYhteystietotyypitQuery,
} = koodistoApi;
