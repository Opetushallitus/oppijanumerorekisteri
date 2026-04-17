import React from "react";
import { useGetMeQuery } from "./api";
import { OphDsPage } from "./design-system/OphDsPage";
import { OphDsButton } from "./design-system/OphDsButton";
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
    <OphDsPage header="Tiedotuspalvelun rapsanäkymä">
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
  return (
    <OphDsPage header="Tiedotuspalvelun rapsanäkymä">
      <CsvButton />
    </OphDsPage>
  );
}

function CsvButton() {
  return (
    <OphDsButton
      variant="primary"
      onClick={() =>
        (window.location.pathname = "/tiedotuspalvelu/ui/tiedotteet/csv")
      }
    >
      Lataa kaikki tiedottet CSV:nä
    </OphDsButton>
  );
}
