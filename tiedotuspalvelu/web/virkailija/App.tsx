import React, { useState } from "react";
import {
  useGetMeQuery,
  useGetTiedotteetQuery,
  useGetTiedoteQuery,
} from "./api";

function TiedoteDetailPane({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetTiedoteQuery(id);

  if (isLoading) return <div className="tp__detail">Ladataan...</div>;
  if (isError)
    return (
      <div className="tp__detail">Virhe ladattaessa tiedotteen tietoja.</div>
    );
  if (!data) return null;

  return (
    <div className="tp__detail">
      <h2 className="tp__detail-title">Tiedotteen tiedot</h2>
      <dl className="tp__detail-fields">
        <dt>ID</dt>
        <dd>{data.id}</dd>
        <dt>Oppijanumero</dt>
        <dd>{data.oppijanumero}</dd>
        <dt>Tyyppi</dt>
        <dd>{data.tiedotetypeId}</dd>
        <dt>Tila</dt>
        <dd>{data.tiedotestateId}</dd>
        {data.opiskeluoikeusOid && (
          <>
            <dt>Opiskeluoikeus</dt>
            <dd>{data.opiskeluoikeusOid}</dd>
          </>
        )}
        <dt>Luotu</dt>
        <dd>{data.created}</dd>
      </dl>

      <h3 className="tp__detail-subtitle">Tapahtumat</h3>
      <ul className="tp__timeline">
        {data.statuses.map((s, i) => (
          <li key={i} className="tp__timeline-item">
            <span className="tp__timeline-status">{s.status}</span>
            <span className="tp__timeline-time">{s.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function App() {
  const meQuery = useGetMeQuery();
  const content = meQuery.isSuccess ? <RealApp /> : <LoginScreen />;
  return (
    <div className="tp">
      <div className="tp__container">{content}</div>
    </div>
  );
}
function LoginScreen() {
  const reutrnUrl = encodeURIComponent(
    window.location.origin + "/tiedotuspalvelu/j_spring_cas_security_check",
  );
  const casLoginUrl = `http://localhost:8888/realms/cas-virkailija/protocol/cas/login?service=${reutrnUrl}`;
  return (
    <>
      <header className="tp__header">
        <Title />
      </header>
      <div>
        <a href={casLoginUrl} className="tp__login-link">
          Kirjaudu sisään
        </a>
      </div>
    </>
  );
}
function Title() {
  return <h1 className="tp__title">Tiedotuspalvelun rapsanäkymä</h1>;
}
function RealApp() {
  const meQuery = useGetMeQuery();
  const tiedotteetQuery = useGetTiedotteetQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <>
      <header className="tp__header">
        <Title />
        <a
          href="/tiedotuspalvelu/ui/tiedotteet/csv"
          className="tp__csv-download"
        >
          Lataa CSV
        </a>
        {meQuery.isSuccess && (
          <>
            <span className="tp__user">{meQuery.data.nimi}</span>
            <a href="/tiedotuspalvelu/logout" className="tp__logout">
              Kirjaudu ulos
            </a>
          </>
        )}
      </header>

      <div className="tp__panes">
        <div className="tp__list-pane">
          {tiedotteetQuery.isLoading && <p>Ladataan...</p>}
          {tiedotteetQuery.isError && <p>Virhe ladattaessa tiedotteita.</p>}

          {tiedotteetQuery.isSuccess && (
            <table className="tp__table">
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
                      row.id === selectedId ? "tp__table-row--selected" : ""
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
          )}
        </div>

        <div className="tp__detail-pane">
          {selectedId ? (
            <TiedoteDetailPane id={selectedId} />
          ) : (
            <div className="tp__detail-placeholder">
              Valitse tiedote listasta
            </div>
          )}
        </div>
      </div>
    </>
  );
}
