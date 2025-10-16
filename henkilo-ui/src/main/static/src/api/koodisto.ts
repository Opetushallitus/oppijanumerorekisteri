import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from './common';
import { Locale } from '../types/locale.type';

export type Koodi = {
    koodiArvo: string;
    koodiUri: string;
    metadata: Array<KoodiMetadata>;
};
export type Koodisto = Array<Koodi>;

export type KoodiMetadata = {
    kieli: string;
    lyhytNimi: string;
    nimi: string;
};

export const koodiLabel = (koodi?: Koodi, locale?: Locale): string | undefined =>
    koodi?.metadata?.find((m) => m.kieli?.toLocaleUpperCase() === locale?.toLocaleUpperCase())?.nimi ??
    koodi?.koodiArvo;

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
        getYhteystietotyypit: builder.query<KoodistoStateKoodi[], void, Koodisto>({
            query: () => 'rest/json/yhteystietotyypit/koodi',
            async transformResponse(baseQueryReturnValue: Koodisto) {
                // Jäi kyllä vähän epäselväksi miksi tälle koodistolle tehdään näin toisin kuin muille
                return baseQueryReturnValue.map((koodi: Koodi) => ({
                    koodiUri: koodi.koodiUri,
                    value: koodi.koodiArvo.toLowerCase(),
                    ...Object.fromEntries(koodi.metadata.map((k) => [k.kieli.toLowerCase(), k.nimi])),
                }));
            },
        }),
    }),
});

export type KoodistoStateKoodi = {
    koodiUri: string;
    value: string;
    [kieli: string]: string;
};

export const {
    useGetHenkilontunnistetyypitQuery,
    useGetKansalaisuudetQuery,
    useGetKieletQuery,
    useGetOppilaitostyypitQuery,
    useGetOrganisaatiotyypitQuery,
    useGetSukupuoletQuery,
    useGetYhteystietotyypitQuery,
} = koodistoApi;
