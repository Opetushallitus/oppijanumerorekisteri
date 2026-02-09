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
    const returnUrl = window.location.origin + "/omat-viestit/logout";
    window.location.href =
      window.location.origin +
      "/cas-oppija/logout?service=" +
      encodeURIComponent(returnUrl);
  },

  changeLanguage: function (lang) {
    setLocale(lang);
    return Promise.resolve();
  },
};
