import { MeResponse } from "./api";
import { setLocale } from "./useLocalisations";

export const Service: typeof window.Service = {
  getUser: () =>
    fetch("/omat-viestit/ui/me")
      .then((_) => _.json())
      .then(
        ({ nimi }: MeResponse): OppijaRaamitUser => ({
          name: nimi,
          usingValtuudet: false,
        }),
      ),

  login: () => {
    window.location.pathname = "/omat-viestit/login";
  },
  logout: () => {
    window.location.pathname = "/omat-viestit/logout";
  },

  changeLanguage: function (lang) {
    setLocale(lang);
    return Promise.resolve();
  },
};
