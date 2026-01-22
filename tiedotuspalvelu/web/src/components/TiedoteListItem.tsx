import React from "react";

import type { Tiedote } from "../api";
import { formatFinnishDate } from "../date";

export function TiedoteListItem({ tiedote }: { tiedote: Tiedote }) {
  const dateText = formatFinnishDate(tiedote.date);

  return (
    <li className="tp__item">
      <span className="tp__date">{dateText}</span>
      <span className="tp__text">
        {tiedote.title ? (
          <>
            {tiedote.title}{" "}
            <a className="tp__link" href={tiedote.url}>
              täältä
            </a>
          </>
        ) : (
          <a className="tp__link" href={tiedote.url}>
            {tiedote.url}
          </a>
        )}
      </span>
    </li>
  );
}
