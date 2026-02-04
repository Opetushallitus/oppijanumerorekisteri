import React from "react";

import { useGetTiedotteetQuery } from "./api";
import { TiedoteSection } from "./components/TiedoteSection";
import { Banner } from "./components/designsystem/Banner";

export function App() {
  const tiedotteetQuery = useGetTiedotteetQuery();

  const isLoading = tiedotteetQuery.isLoading;
  const isError = tiedotteetQuery.isError;

  const tiedotteet = tiedotteetQuery.isSuccess ? tiedotteetQuery.data : [];

  return (
    <div className="tp">
      <div className="tp__container">
        <h1 className="tp__title">Tiedotteeni</h1>

        {isLoading && <p className="tp__muted">Ladataan tietoja...</p>}
        {isError && (
          <Banner
            title={
              "Jokin meni vikaan. Jos virhe aiheuttaa ongelmia, yritä päivittää sivu."
            }
          />
        )}

        {tiedotteetQuery.isSuccess && (
          <TiedoteSection
            title="Tiedotteet"
            items={tiedotteet}
            emptyText="Ei tiedotteita."
          />
        )}
      </div>
    </div>
  );
}
