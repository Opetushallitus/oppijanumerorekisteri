import React from "react";

import type { TiedoteDto } from "../api";
import { TiedoteListItem } from "./TiedoteListItem";

export function TiedoteSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: TiedoteDto[];
  emptyText: string;
}) {
  return (
    <section className="tp__section" aria-label={title}>
      <h2 className="tp__sectionTitle">{title}</h2>

      {items.length === 0 ? (
        <p className="tp__muted">{emptyText}</p>
      ) : (
        <ul className="tp__list">
          {items.map((t) => (
            <TiedoteListItem key={t.id} tiedote={t} />
          ))}
        </ul>
      )}
    </section>
  );
}
