import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type MeResponse = {
  nimi: string;
};

export type TiedoteDto = {
  id: string;
  otsikko: string;
  viesti: string;
  url: string;
  createdAt: string;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/omat-viestit/ui" }),
  tagTypes: ["me", "tiedotteet"],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => "me",
      providesTags: ["me"],
    }),
    getTiedotteet: builder.query<TiedoteDto[], void>({
      query: () => "tiedotteet",
      providesTags: ["tiedotteet"],
    }),
  }),
});

export const { useGetMeQuery, useGetTiedotteetQuery } = api;
