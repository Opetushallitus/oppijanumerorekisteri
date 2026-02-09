import React from "react";

import type { TiedoteDto } from "../api";
import { TiedoteListItem } from "./TiedoteListItem";

export function TiedoteSection({
  title,
  items,
}: {
  title: string;
  items: TiedoteDto[];
}) {
  return (
    <section className="tp__section" aria-label={title}>
      {items.length === 0 ? (
        <p className="tp__muted">Ei tiedotteita.</p>
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
