import React from "react";

import { useGetMeQuery, useGetTiedotteetQuery } from "./api";

export function App() {
  const meQuery = useGetMeQuery();
  const tiedotteetQuery = useGetTiedotteetQuery();

  const isLoading = meQuery.isLoading || tiedotteetQuery.isLoading;
  const isError = meQuery.isError || tiedotteetQuery.isError;

  return (
    <div>
      <h1>Tiedotteet</h1>

      {isLoading && <p>Ladataan tietoja...</p>}
      {isError && (
        <p>
          Tapahtui odottamaton virhe tietojen lataamisessa. Yritä hetken
          kuluttua uudelleen.
        </p>
      )}

      {meQuery.isSuccess && <p>Moikka, {meQuery.data.etunimi}!</p>}

      {tiedotteetQuery.isSuccess && tiedotteetQuery.data.length === 0 && (
        <p>Ei tiedotteita.</p>
      )}

      {tiedotteetQuery.isSuccess && tiedotteetQuery.data.length > 0 && (
        <ul>
          {tiedotteetQuery.data.map((t) => (
            <li key={t.id}>
              <a href={t.url}>{t.url}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
