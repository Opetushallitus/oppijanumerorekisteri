declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

type OppijaRaamitUser = {
  name: string;
  usingValtuudet: boolean;
};

declare var Service: {
  getUser: () => Promise<OppijaRaamitUser>;
  login: () => void;
  logout: () => void;
  changeLanguage: (lang: "fi" | "sv" | "en") => Promise<void>;
};
