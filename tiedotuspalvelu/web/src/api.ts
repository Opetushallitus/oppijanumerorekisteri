import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type MeResponse = { etunimi: string };

type Tiedote = { id: string; url: string };

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/omat-viestit/ui" }),
  tagTypes: ["me", "tiedotteet"],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => "me",
      providesTags: ["me"],
    }),
    getTiedotteet: builder.query<Tiedote[], void>({
      query: () => "tiedotteet",
      providesTags: ["tiedotteet"],
    }),
  }),
});

export const { useGetMeQuery, useGetTiedotteetQuery } = api;
