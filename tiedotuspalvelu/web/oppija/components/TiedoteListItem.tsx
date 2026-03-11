import React from "react";

import type { TiedoteDto } from "../api";
import { formatFinnishDate } from "../date";
import { useLocalisations } from "../useLocalisations";

export function TiedoteListItem({ tiedote }: { tiedote: TiedoteDto }) {
  const dateText = formatFinnishDate(tiedote.createdAt);
  const { t } = useLocalisations();

  return (
    <li className="tp__item">
      <span className="tp__date">{dateText}</span>
      <span className="tp__text">
        {t("OMAT_VIESTIT_KIELITUTKINTOTODISTUS_VIESTI")}{" "}
        <a className="tp__link" target="_blank" href="/koski/omattiedot">
          {t("OMAT_VIESTIT_KIELITUTKINTOTODISTUS_LINKKI")}
        </a>
      </span>
    </li>
  );
}
