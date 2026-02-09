import { useCallback, useSyncExternalStore } from "react";

import { useGetLocalisationsQuery } from "./api";

type Locale = "fi" | "sv" | "en";

const VALID_LOCALES: Locale[] = ["fi", "sv", "en"];

function readLangCookie(): Locale {
  const match = document.cookie.split("; ").find((c) => c.startsWith("lang="));
  const value = match?.split("=")[1];
  if (value && VALID_LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
  return "fi";
}

let currentLocale: Locale = readLangCookie();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  for (const listener of listeners) {
    listener();
  }
}

export function useLocalisations() {
  const locale = useSyncExternalStore(subscribe, getSnapshot);
  const { data: localisations } = useGetLocalisationsQuery();

  const t = useCallback(
    (key: string): string => {
      if (!localisations) return key;

      const match = localisations.find(
        (l) => l.key === key && l.locale === locale,
      );
      if (match) return match.value;

      const fiFallback = localisations.find(
        (l) => l.key === key && l.locale === "fi",
      );
      if (fiFallback) return fiFallback.value;

      return key;
    },
    [localisations, locale],
  );

  return { t, locale };
}
