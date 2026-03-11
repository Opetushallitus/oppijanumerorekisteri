import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type MeResponse = {
  nimi: string;
};

export type TiedoteRow = {
  id: string;
  oppijanumero: string;
  created: string;
  tiedotestate_id: string;
  tiedotetype_id: string;
};

export type StatusEntry = {
  status: string;
  timestamp: string;
};

export type TiedoteDetail = {
  id: string;
  oppijanumero: string;
  tiedotetypeId: string;
  tiedotestateId: string;
  opiskeluoikeusOid: string | null;
  created: string;
  statuses: StatusEntry[];
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/tiedotuspalvelu/ui" }),
  tagTypes: ["me", "tiedotteet"],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => "me",
      providesTags: ["me"],
    }),
    getTiedotteet: builder.query<TiedoteRow[], void>({
      query: () => "tiedotteet",
      providesTags: ["tiedotteet"],
    }),
    getTiedote: builder.query<TiedoteDetail, string>({
      query: (id) => `tiedotteet/${id}`,
    }),
  }),
});

export const { useGetMeQuery, useGetTiedotteetQuery, useGetTiedoteQuery } = api;
