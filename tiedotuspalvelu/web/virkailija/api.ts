import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type MeResponse = {
  nimi: string;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/tiedotuspalvelu/ui" }),
  tagTypes: ["me"],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => "me",
      providesTags: ["me"],
    }),
  }),
});

export const { useGetMeQuery } = api;
