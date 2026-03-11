import React from "react";

import { useGetTiedotteetQuery } from "./api";
import { TiedoteSection } from "./components/TiedoteSection";
import { Banner } from "./components/designsystem/Banner";
import { useLocalisations } from "./useLocalisations";

export function App() {
  const tiedotteetQuery = useGetTiedotteetQuery();
  const { t } = useLocalisations();

  const isLoading = tiedotteetQuery.isLoading;
  const isError = tiedotteetQuery.isError;

  const tiedotteet = tiedotteetQuery.isSuccess ? tiedotteetQuery.data : [];

  return (
    <div className="tp">
      <div className="tp__container">
        <h1 className="tp__title">{t("OMAT_VIESTIT_OTSIKKO")}</h1>

        {isLoading && <p className="tp__muted">{t("OMAT_VIESTIT_LADATAAN")}</p>}
        {isError && <Banner title={t("OMAT_VIESTIT_VIRHE")} />}

        {tiedotteetQuery.isSuccess && (
          <TiedoteSection
            title={t("OMAT_VIESTIT_TIEDOTTEET")}
            items={tiedotteet}
          />
        )}
      </div>
    </div>
  );
}
