import React from "react";

import type { TiedoteDto } from "../api";
import { formatFinnishDate } from "../date";

export function TiedoteListItem({ tiedote }: { tiedote: TiedoteDto }) {
  const dateText = formatFinnishDate(tiedote.createdAt);

  return (
    <li className="tp__item">
      <span className="tp__date">{dateText}</span>
      <span className="tp__text">
        {tiedote.otsikko}{" "}
        <a className="tp__link" target="_blank" href="/koski/omattiedot">
          täältä
        </a>
      </span>
    </li>
  );
}
