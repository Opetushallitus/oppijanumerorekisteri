import { MeResponse } from "./api";

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

  login: () => (window.location.pathname = "/omat-viestit/login"),
  logout: () => (window.location.pathname = "/omat-viestit/logout"),

  changeLanguage: function () {
    return Promise.resolve();
  },
};
