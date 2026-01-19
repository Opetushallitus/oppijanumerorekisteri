import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type MeResponse = { etunimi: string };

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/omat-viestit/ui" }),
  tagTypes: ["me"],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => "me",
      providesTags: ["me"],
    }),
  }),
});

export const { useGetMeQuery } = api;
