import React from "react";

import { useGetMeQuery } from "./api";

export function App() {
  const meQuery = useGetMeQuery();

  return (
    <div>
      <h1>Tiedotteet</h1>

      {meQuery.isLoading && <p>Ladataan tietoja...</p>}
      {meQuery.isError && (
        <p>
          Tapahtui odottamaton virhe tietojen lataamisessa. Yritä hetken
          kuluttua uudelleen.
        </p>
      )}
      {meQuery.isSuccess && <p>Moikka, {meQuery.data.etunimi}!</p>}
    </div>
  );
}
