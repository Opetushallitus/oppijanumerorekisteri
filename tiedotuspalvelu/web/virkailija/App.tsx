import React, { useState } from "react";
import {
  useGetMeQuery,
  useGetTiedoteQuery,
  useGetTiedotteetQuery,
} from "./api";
import { OphDsCard } from "./design-system/OphDsCard";
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
  const meQuery = useGetMeQuery();
  const tiedotteetQuery = useGetTiedotteetQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <OphDsPage header="Tiedotuspalvelun rapsanäkymä">
      <header className="rapsa-header">
        <CsvButton />
        {meQuery.isSuccess && <LogoutButton />}
      </header>

      <div className="rapsa">
        <div className="rapsa-lista-paneeli">
          {tiedotteetQuery.isLoading && <p>Ladataan...</p>}
          {tiedotteetQuery.isError && <p>Virhe ladattaessa tiedotteita.</p>}

          {tiedotteetQuery.isSuccess && (
            <>
              <table className="oph-ds-table">
                <thead>
                  <tr>
                    <th>Oppijanumero</th>
                    <th>Tila</th>
                    <th>Luotu</th>
                  </tr>
                </thead>
                <tbody>
                  {tiedotteetQuery.data.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.id === selectedId ? "oph-ds-table-row-selected" : ""
                      }
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>{row.oppijanumero}</td>
                      <td>{row.tiedotestate_id}</td>
                      <td>{row.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="rapsa-detsku-paneeli">
          {selectedId ? (
            <TiedoteDetailPane id={selectedId} />
          ) : (
            <OphDsCard>Valitse tiedote listasta</OphDsCard>
          )}
        </div>
      </div>
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
function LogoutButton() {
  return (
    <OphDsButton
      variant="bordered"
      onClick={() => (window.location.pathname = "/tiedotuspalvelu/logout")}
    >
      Kirjaudu ulos
    </OphDsButton>
  );
}

function TiedoteDetailPane({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetTiedoteQuery(id);

  if (isLoading) return <OphDsCard>Ladataan...</OphDsCard>;
  if (isError)
    return <OphDsCard>Virhe ladattaessa tiedotteen tietoja.</OphDsCard>;
  if (!data) return null;

  return (
    <OphDsCard>
      <dl>
        <dt>Tiedotteen ID</dt>
        <dd>{data.id}</dd>
        <dt>Oppijanumero</dt>
        <dd>{data.oppijanumero}</dd>
        <dt>Tiedotteen tyyppi</dt>
        <dd>{data.tiedotetypeId}</dd>
        <dt>Tiedotteen käsittelyn tila</dt>
        <dd>{data.tiedotestateId}</dd>
        <dt>Opiskeluoikeus</dt>
        <dd>{data.opiskeluoikeusOid}</dd>
        <dt>Luotu</dt>
        <dd>{data.created}</dd>
      </dl>
      <h3>Tapahtumat</h3>
      <table>
        <thead>
          <tr>
            <td>Tila</td>
            <td>Aikaleima</td>
          </tr>
        </thead>
        <tbody>
          {data.statuses.map((s, i) => (
            <tr key={i}>
              <td>{s.status}</td>
              <td>{s.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </OphDsCard>
  );
}
