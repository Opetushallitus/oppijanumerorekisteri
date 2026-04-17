import React from "react";
import { useGetMeQuery } from "./api";
import { OphDsPage } from "./design-system/OphDsPage";
import { OphDsButton } from "./design-system/OphDsButton";
import { useLocalisations } from "./useLocalisations";
export function App() {
  const meQuery = useGetMeQuery();
  return meQuery.isSuccess ? <RealApp /> : <LoginScreen />;
}

function LoginScreen() {
  const reutrnUrl = encodeURIComponent(
    window.location.origin + "/tiedotuspalvelu/j_spring_cas_security_check",
  );
  const casLoginUrl = `http://localhost:8888/realms/cas-virkailija/protocol/cas/login?service=${reutrnUrl}`;
  return (
    <OphDsPage header="Tiedotuspalvelu">
      <OphDsButton
        variant="primary"
        onClick={() => (window.location.href = casLoginUrl)}
      >
        Kirjaudu sisään
      </OphDsButton>
    </OphDsPage>
  );
}
function RealApp() {
  const { t } = useLocalisations();
  return (
    <OphDsPage header={t("TIEDOTUSPALVELU_OTSIKKO")}>
      <CsvButton />
    </OphDsPage>
  );
}

function CsvButton() {
  const { t } = useLocalisations();
  return (
    <OphDsButton
      variant="primary"
      onClick={() =>
        (window.location.pathname = "/tiedotuspalvelu/ui/tiedotteet/csv")
      }
    >
      {t("TIEDOTUSPALVELU_LATAA_CSV")}
    </OphDsButton>
  );
}
