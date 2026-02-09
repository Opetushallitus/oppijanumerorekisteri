import React from "react";

import type { TiedoteDto } from "../api";
import { useLocalisations } from "../useLocalisations";
import { TiedoteListItem } from "./TiedoteListItem";

export function TiedoteSection({
  title,
  items,
}: {
  title: string;
  items: TiedoteDto[];
}) {
  const { t } = useLocalisations();

  return (
    <section className="tp__section" aria-label={title}>
      {items.length === 0 ? (
        <p className="tp__muted">{t("OMAT_VIESTIT_EI_TIEDOTTEITA")}</p>
      ) : (
        <ul className="tp__list">
          {items.map((item) => (
            <TiedoteListItem key={item.id} tiedote={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
