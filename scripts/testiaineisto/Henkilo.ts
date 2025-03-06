// To parse this data:
//
//   import { Convert } from "./file";
//
//   const henkilo = Convert.toHenkilo(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Henkilo {
    status:              HenkiloStatus;
    code:                string;
    vtjData:             VtjData | null;
    virreCompanyRoles:   VirreCompanyRole[];
    targetedPersonRoles: EdPersonRole[];
    propertyShares:      PropertyShare[];
}

export interface PropertyShare {
    type:                           PropertyShareType;
    ownerType:                      OwnerType;
    person:                         string;
    company:                        null;
    property:                       string;
    share:                          Share | null;
    name:                           null;
    shareNumerator:                 number | null;
    shareDenominator:               number | null;
    leaseholdIdentifier:            null | string;
    parcelIdentifier:               null | string;
    caseNumber:                     null | string;
    unregisteredTransferIdentifier: null | string;
}

export enum OwnerType {
    Kp = "KP",
    Lu = "LU",
}

export enum Share {
    The11 = "1/1",
    The110 = "1/10",
    The12 = "1/2",
    The13 = "1/3",
    The14 = "1/4",
    The15 = "1/5",
    The2100 = "2/100",
    The21000 = "2/1000",
    The220 = "2/20",
    The320 = "3/20",
    The520 = "5/20",
}

export enum PropertyShareType {
    Person = "person",
}

export enum HenkiloStatus {
    Active = "active",
    Passive = "passive",
}

export interface EdPersonRole {
    birthday:       Date | null;
    ownerPerson:    string;
    targetPerson:   null | string;
    role:           TargetedPersonRoleRole;
    P301:           number | null;
    P302:           number | null;
    P501:           number | null;
    P502:           number | null;
    P701:           number | null;
    sharedCareCode: number | null;
    T101:           number | null;
    T102:           number | null;
    T201:           number | null;
    T202:           number | null;
}

export enum TargetedPersonRoleRole {
    Dependent = "dependent",
    RightToInformation = "rightToInformation",
}

export interface VirreCompanyRole {
    company: string;
    person:  string;
    role:    VirreCompanyRoleRole;
    type:    VirreCompanyRoleType;
    status:  VirreCompanyRoleStatus;
}

export enum VirreCompanyRoleRole {
    Edu = "EDU",
    Eli = "ELI",
    Is = "IS",
    J = "J",
    Jo = "JO",
    Lt = "LT",
    Oi = "OI",
    PR = "PR",
    Pis = "PIS",
    Pj = "PJ",
    Pti = "PTI",
    S = "S",
    Sans = "SANS",
    T = "T",
    Tj = "TJ",
    Tjs = "TJS",
    VT = "VT",
    Vj = "VJ",
    Yhm = "YHM",
    Yhmä = "YHMÄ",
}

export enum VirreCompanyRoleStatus {
    Kuollut = "KUOLLUT",
    Liiketoimintakielto = "LIIKETOIMINTAKIELTO",
    Normaali = "NORMAALI",
}

export enum VirreCompanyRoleType {
    Edu = "EDU",
    Eli = "ELI",
    HAL = "HAL",
    Hn = "HN",
    Is = "IS",
    Jo = "JO",
    Oi = "OI",
    PR = "PR",
    Sans = "SANS",
    Selm = "SELM",
    Til = "TIL",
    Tj = "TJ",
    Tjs = "TJS",
    Yhm = "YHM",
}

export interface VtjData {
    source:                Source;
    identificationMethod:  IdentificationMethod;
    firstNames:            string;
    lastName:              string;
    birthday:              Date;
    gender:                Gender;
    primaryLanguage:       PrimaryLanguage;
    nationality:           Nationality[];
    maritalStatus:         MaritalStatus;
    childCount:            number;
    hasTrustee:            boolean;
    hasProtectionOrder:    boolean;
    hasTakingIntoCare:     boolean;
    dateOfDeath:           null | string;
    code:                  string;
    individualizationCode: null | string;
    homeMunicipality:      HomeMunicipality;
    addresses:             Address[];
    ownedPersonRoles:      EdPersonRole[];
}

export interface Address {
    type:                  AddressType;
    address:               null | string;
    postalCode:            null | string;
    postalDistrict:        PostalDistrict | null;
    countryCode:           null | string;
    foreignCity:           null;
    foreignCityAndCountry: null | string;
    startDate:             null | string;
    endDate:               null | string;
    person:                string;
}

export enum PostalDistrict {
    Eckerö = "ECKERÖ",
    Espoo = "ESPOO",
    Hammaslahti = "HAMMASLAHTI",
    Helsinki = "HELSINKI",
    Hyvinkää = "HYVINKÄÄ",
    Hämeenlinna = "HÄMEENLINNA",
    Härmä = "HÄRMÄ",
    Joensuu = "JOENSUU",
    Jyväskylä = "JYVÄSKYLÄ",
    Järvenpää = "JÄRVENPÄÄ",
    Karkkila = "KARKKILA",
    Kastelholm = "KASTELHOLM",
    Kellokoski = "KELLOKOSKI",
    Kokkola = "KOKKOLA",
    Korvatunturi = "KORVATUNTURI",
    Kotka = "KOTKA",
    Kristiinankaupunki = "KRISTIINANKAUPUNKI",
    Kruunupyy = "KRUUNUPYY",
    Kuhmo = "KUHMO",
    Kuopio = "KUOPIO",
    Lahti = "LAHTI",
    Laihia = "LAIHIA",
    Lappeenranta = "LAPPEENRANTA",
    Laukkoski = "LAUKKOSKI",
    Lohja = "LOHJA",
    Mariehamn = "MARIEHAMN",
    Masku = "MASKU",
    Mikkeli = "MIKKELI",
    Mustasaari = "MUSTASAARI",
    Mynämäki = "MYNÄMÄKI",
    Nousiainen = "NOUSIAINEN",
    Nuorgam = "NUORGAM",
    Ohkola = "OHKOLA",
    Oitti = "OITTI",
    Parolannummi = "PAROLANNUMMI",
    Perttula = "PERTTULA",
    Pori = "PORI",
    Pornainen = "PORNAINEN",
    Rautalampi = "RAUTALAMPI",
    Riihimäki = "RIIHIMÄKI",
    Rovaniemi = "ROVANIEMI",
    Ruuvaoja = "RUUVAOJA",
    Savonlinna = "SAVONLINNA",
    Seinäjoki = "SEINÄJOKI",
    Säkylä = "SÄKYLÄ",
    Tampere = "TAMPERE",
    Turku = "TURKU",
    Tuupovaara = "TUUPOVAARA",
    Utsjoki = "UTSJOKI",
    Uurainen = "UURAINEN",
    Vaasa = "VAASA",
    Vantaa = "VANTAA",
    Varkaus = "VARKAUS",
    Vihti = "VIHTI",
    Ylihärmä = "YLIHÄRMÄ",
}

export enum AddressType {
    ForeignContactAddress = "foreignContactAddress",
    ForeignMailingAddress = "foreignMailingAddress",
    FormerForeignContactAddress = "formerForeignContactAddress",
    FormerForeignMailingAddress = "formerForeignMailingAddress",
    FormerLocalContactAddress = "formerLocalContactAddress",
    FormerLocalMailingAddress = "formerLocalMailingAddress",
    FormerPermanentForeignStreetAddress = "formerPermanentForeignStreetAddress",
    FormerPermanentLocalStreetAddress = "formerPermanentLocalStreetAddress",
    FormerTemporaryForeignStreetAddress = "formerTemporaryForeignStreetAddress",
    FormerTemporaryLocalStreetAddress = "formerTemporaryLocalStreetAddress",
    LocalContactAddress = "localContactAddress",
    LocalMailingAddress = "localMailingAddress",
    PermanentForeignStreetAddress = "permanentForeignStreetAddress",
    PermanentLocalStreetAddress = "permanentLocalStreetAddress",
    TemporaryForeignStreetAddress = "temporaryForeignStreetAddress",
    TemporaryLocalStreetAddress = "temporaryLocalStreetAddress",
}

export enum Gender {
    Mies = "mies",
    Nainen = "nainen",
}

export enum HomeMunicipality {
    Alahärmä = "Alahärmä",
    Anttola = "Anttola",
    EiKotikuntaaSuomessa = "Ei kotikuntaa Suomessa",
    EiTietoa = "ei tietoa",
    Espoo = "Espoo",
    Helsinki = "Helsinki",
    Hollola = "Hollola",
    Hyvinkää = "Hyvinkää",
    Iisalmi = "Iisalmi",
    Jyväskylä = "Jyväskylä",
    Jäppilä = "Jäppilä",
    Järvenpää = "Järvenpää",
    Karkkila = "Karkkila",
    Kotka = "Kotka",
    Kuhmo = "Kuhmo",
    Kuopio = "Kuopio",
    Lahti = "Lahti",
    Laihia = "Laihia",
    Lappeenranta = "Lappeenranta",
    Lohja = "Lohja",
    Maarianhamina = "Maarianhamina",
    Masku = "Masku",
    Mikkeli = "Mikkeli",
    Mynämäki = "Mynämäki",
    Mäntsälä = "Mäntsälä",
    Nousiainen = "Nousiainen",
    Nurmijärvi = "Nurmijärvi",
    Oulu = "Oulu",
    PieksämäenMlk = "Pieksämäen mlk",
    Pori = "Pori",
    Pornainen = "Pornainen",
    Pyhäselkä = "Pyhäselkä",
    Rovaniemi = "Rovaniemi",
    Savonlinna = "Savonlinna",
    Seinäjoki = "Seinäjoki",
    Tampere = "Tampere",
    Tuntematon = "Tuntematon",
    Turku = "Turku",
    Tuusula = "Tuusula",
    Ulkomaat = "Ulkomaat",
    Utsjoki = "Utsjoki",
    Vaasa = "Vaasa",
    Vantaa = "Vantaa",
    Varkaus = "Varkaus",
    Vihti = "Vihti",
}

export enum IdentificationMethod {
    EiTietoa = "ei tietoa",
    Kasvokkain = "kasvokkain",
}

export enum MaritalStatus {
    Asumuserossa = "asumuserossa",
    Avioliitossa = "avioliitossa",
    EiTietoa = "ei tietoa",
    Eronnut = "eronnut",
    EronnutRekisteröidystäParisuhteesta = "eronnut rekisteröidystä parisuhteesta",
    Leski = "leski",
    LeskiRekisteröidystäParisuhteesta = "leski rekisteröidystä parisuhteesta",
    Naimaton = "naimaton",
    RekisteröidyssäParisuhteessa = "rekisteröidyssä parisuhteessa",
}

export enum Nationality {
    Angola = "Angola",
    Ankkalinna = "Ankkalinna",
    Appelsiinisaaret = "Appelsiinisaaret",
    Argentiina = "Argentiina",
    Australia = "Australia",
    Bahama = "Bahama",
    Bahrain = "Bahrain",
    Barbados = "Barbados",
    Bhutan = "Bhutan",
    BosniaHertsegovina = "Bosnia-Hertsegovina",
    Botswana = "Botswana",
    Brasilia = "Brasilia",
    Brunei = "Brunei",
    EiSelvit = "Ei selvit",
    EiTiedossaM = "Ei tiedossa (M)",
    EiTietoa = "ei tietoa",
    Ghana = "Ghana",
    Irlanti = "Irlanti",
    Italia = "Italia",
    JemenKdTv = "Jemen Kd Tv",
    Jugoslavia = "Jugoslavia",
    JukuMikäMaa = "* Juku mikä maa *",
    Kanada = "Kanada",
    Kaukomaat = "Kaukomaat",
    Kiina = "Kiina",
    Kosovo = "KOSOVO",
    Koulutustestivaltio = "Koulutustestivaltio",
    Kreikka = "Kreikka",
    Marokko = "Marokko",
    Neuvostoliitto = "Neuvostoliitto",
    Norja = "Norja",
    OmaValtio = "Oma valtio",
    Ranska = "Ranska",
    Reunion = "Reunion",
    Ruotsi = "Ruotsi",
    Saaret = "Saaret",
    Saksa = "Saksa",
    SaksaDemTv = "Saksa Dem Tv",
    Seleväkielinen = "Seleväkielinen",
    SerbiaJaMontenegro = "Serbia ja Montenegro",
    Suomi = "Suomi",
    Sveitsi = "Sveitsi",
    Tanska = "Tanska",
    Tsekki = "Tsekki",
    Tuntematon = "Tuntematon",
    Unkari = "Unkari",
    Venäjä = "Venäjä",
    Viro = "Viro",
    Yhdysvallat = "Yhdysvallat",
}

export enum PrimaryLanguage {
    Abhaasi = "abhaasi",
    Adangme = "adangme",
    Arabia = "arabia",
    BaskiEuskara = "baski, euskara",
    EiTietoa = "ei tietoa",
    Englanti = "englanti",
    Eteläsaame = "eteläsaame",
    Iiri = "iiri",
    Italia = "italia",
    Kanuri = "kanuri",
    Koltansaame = "koltansaame",
    Kreikka = "kreikka",
    Norja = "norja",
    Pohjoissaame = "pohjoissaame",
    Portugali = "portugali",
    Ranska = "ranska",
    Ruotsi = "ruotsi",
    Saamelaiskieli = "saamelaiskieli",
    Saksa = "saksa",
    SlaavilainenKieli = "slaavilainen kieli",
    SuomalainenViittomakieli = "suomalainen viittomakieli",
    Suomi = "suomi",
    Tanska = "tanska",
    Tuntematon = "tuntematon",
    Venäjä = "venäjä",
    Viittomakieli = "viittomakieli",
    ViroEesti = "viro, eesti",
    Zhuang = "zhuang",
}

export enum Source {
    Vtj = "VTJ",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toHenkilo(json: string): Henkilo[] {
        return cast(JSON.parse(json), a(r("Henkilo")));
    }

    public static henkiloToJson(value: Henkilo[]): string {
        return JSON.stringify(uncast(value, a(r("Henkilo"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Henkilo": o([
        { json: "status", js: "status", typ: r("HenkiloStatus") },
        { json: "code", js: "code", typ: "" },
        { json: "vtjData", js: "vtjData", typ: u(r("VtjData"), null) },
        { json: "virreCompanyRoles", js: "virreCompanyRoles", typ: a(r("VirreCompanyRole")) },
        { json: "targetedPersonRoles", js: "targetedPersonRoles", typ: a(r("EdPersonRole")) },
        { json: "propertyShares", js: "propertyShares", typ: a(r("PropertyShare")) },
    ], false),
    "PropertyShare": o([
        { json: "type", js: "type", typ: r("PropertyShareType") },
        { json: "ownerType", js: "ownerType", typ: r("OwnerType") },
        { json: "person", js: "person", typ: "" },
        { json: "company", js: "company", typ: null },
        { json: "property", js: "property", typ: "" },
        { json: "share", js: "share", typ: u(r("Share"), null) },
        { json: "name", js: "name", typ: null },
        { json: "shareNumerator", js: "shareNumerator", typ: u(0, null) },
        { json: "shareDenominator", js: "shareDenominator", typ: u(0, null) },
        { json: "leaseholdIdentifier", js: "leaseholdIdentifier", typ: u(null, "") },
        { json: "parcelIdentifier", js: "parcelIdentifier", typ: u(null, "") },
        { json: "caseNumber", js: "caseNumber", typ: u(null, "") },
        { json: "unregisteredTransferIdentifier", js: "unregisteredTransferIdentifier", typ: u(null, "") },
    ], false),
    "EdPersonRole": o([
        { json: "birthday", js: "birthday", typ: u(Date, null) },
        { json: "ownerPerson", js: "ownerPerson", typ: "" },
        { json: "targetPerson", js: "targetPerson", typ: u(null, "") },
        { json: "role", js: "role", typ: r("TargetedPersonRoleRole") },
        { json: "P301", js: "P301", typ: u(0, null) },
        { json: "P302", js: "P302", typ: u(0, null) },
        { json: "P501", js: "P501", typ: u(0, null) },
        { json: "P502", js: "P502", typ: u(0, null) },
        { json: "P701", js: "P701", typ: u(0, null) },
        { json: "sharedCareCode", js: "sharedCareCode", typ: u(0, null) },
        { json: "T101", js: "T101", typ: u(0, null) },
        { json: "T102", js: "T102", typ: u(0, null) },
        { json: "T201", js: "T201", typ: u(0, null) },
        { json: "T202", js: "T202", typ: u(0, null) },
    ], false),
    "VirreCompanyRole": o([
        { json: "company", js: "company", typ: "" },
        { json: "person", js: "person", typ: "" },
        { json: "role", js: "role", typ: r("VirreCompanyRoleRole") },
        { json: "type", js: "type", typ: r("VirreCompanyRoleType") },
        { json: "status", js: "status", typ: r("VirreCompanyRoleStatus") },
    ], false),
    "VtjData": o([
        { json: "source", js: "source", typ: r("Source") },
        { json: "identificationMethod", js: "identificationMethod", typ: r("IdentificationMethod") },
        { json: "firstNames", js: "firstNames", typ: "" },
        { json: "lastName", js: "lastName", typ: "" },
        { json: "birthday", js: "birthday", typ: Date },
        { json: "gender", js: "gender", typ: r("Gender") },
        { json: "primaryLanguage", js: "primaryLanguage", typ: r("PrimaryLanguage") },
        { json: "nationality", js: "nationality", typ: a(r("Nationality")) },
        { json: "maritalStatus", js: "maritalStatus", typ: r("MaritalStatus") },
        { json: "childCount", js: "childCount", typ: 0 },
        { json: "hasTrustee", js: "hasTrustee", typ: true },
        { json: "hasProtectionOrder", js: "hasProtectionOrder", typ: true },
        { json: "hasTakingIntoCare", js: "hasTakingIntoCare", typ: true },
        { json: "dateOfDeath", js: "dateOfDeath", typ: u(null, "") },
        { json: "code", js: "code", typ: "" },
        { json: "individualizationCode", js: "individualizationCode", typ: u(null, "") },
        { json: "homeMunicipality", js: "homeMunicipality", typ: r("HomeMunicipality") },
        { json: "addresses", js: "addresses", typ: a(r("Address")) },
        { json: "ownedPersonRoles", js: "ownedPersonRoles", typ: a(r("EdPersonRole")) },
    ], false),
    "Address": o([
        { json: "type", js: "type", typ: r("AddressType") },
        { json: "address", js: "address", typ: u(null, "") },
        { json: "postalCode", js: "postalCode", typ: u(null, "") },
        { json: "postalDistrict", js: "postalDistrict", typ: u(r("PostalDistrict"), null) },
        { json: "countryCode", js: "countryCode", typ: u(null, "") },
        { json: "foreignCity", js: "foreignCity", typ: null },
        { json: "foreignCityAndCountry", js: "foreignCityAndCountry", typ: u(null, "") },
        { json: "startDate", js: "startDate", typ: u(null, "") },
        { json: "endDate", js: "endDate", typ: u(null, "") },
        { json: "person", js: "person", typ: "" },
    ], false),
    "OwnerType": [
        "KP",
        "LU",
    ],
    "Share": [
        "1/1",
        "1/10",
        "1/2",
        "1/3",
        "1/4",
        "1/5",
        "2/100",
        "2/1000",
        "2/20",
        "3/20",
        "5/20",
    ],
    "PropertyShareType": [
        "person",
    ],
    "HenkiloStatus": [
        "active",
        "passive",
    ],
    "TargetedPersonRoleRole": [
        "dependent",
        "rightToInformation",
    ],
    "VirreCompanyRoleRole": [
        "EDU",
        "ELI",
        "IS",
        "J",
        "JO",
        "LT",
        "OI",
        "PR",
        "PIS",
        "PJ",
        "PTI",
        "S",
        "SANS",
        "T",
        "TJ",
        "TJS",
        "VT",
        "VJ",
        "YHM",
        "YHMÄ",
    ],
    "VirreCompanyRoleStatus": [
        "KUOLLUT",
        "LIIKETOIMINTAKIELTO",
        "NORMAALI",
    ],
    "VirreCompanyRoleType": [
        "EDU",
        "ELI",
        "HAL",
        "HN",
        "IS",
        "JO",
        "OI",
        "PR",
        "SANS",
        "SELM",
        "TIL",
        "TJ",
        "TJS",
        "YHM",
    ],
    "PostalDistrict": [
        "ECKERÖ",
        "ESPOO",
        "HAMMASLAHTI",
        "HELSINKI",
        "HYVINKÄÄ",
        "HÄMEENLINNA",
        "HÄRMÄ",
        "JOENSUU",
        "JYVÄSKYLÄ",
        "JÄRVENPÄÄ",
        "KARKKILA",
        "KASTELHOLM",
        "KELLOKOSKI",
        "KOKKOLA",
        "KORVATUNTURI",
        "KOTKA",
        "KRISTIINANKAUPUNKI",
        "KRUUNUPYY",
        "KUHMO",
        "KUOPIO",
        "LAHTI",
        "LAIHIA",
        "LAPPEENRANTA",
        "LAUKKOSKI",
        "LOHJA",
        "MARIEHAMN",
        "MASKU",
        "MIKKELI",
        "MUSTASAARI",
        "MYNÄMÄKI",
        "NOUSIAINEN",
        "NUORGAM",
        "OHKOLA",
        "OITTI",
        "PAROLANNUMMI",
        "PERTTULA",
        "PORI",
        "PORNAINEN",
        "RAUTALAMPI",
        "RIIHIMÄKI",
        "ROVANIEMI",
        "RUUVAOJA",
        "SAVONLINNA",
        "SEINÄJOKI",
        "SÄKYLÄ",
        "TAMPERE",
        "TURKU",
        "TUUPOVAARA",
        "UTSJOKI",
        "UURAINEN",
        "VAASA",
        "VANTAA",
        "VARKAUS",
        "VIHTI",
        "YLIHÄRMÄ",
    ],
    "AddressType": [
        "foreignContactAddress",
        "foreignMailingAddress",
        "formerForeignContactAddress",
        "formerForeignMailingAddress",
        "formerLocalContactAddress",
        "formerLocalMailingAddress",
        "formerPermanentForeignStreetAddress",
        "formerPermanentLocalStreetAddress",
        "formerTemporaryForeignStreetAddress",
        "formerTemporaryLocalStreetAddress",
        "localContactAddress",
        "localMailingAddress",
        "permanentForeignStreetAddress",
        "permanentLocalStreetAddress",
        "temporaryForeignStreetAddress",
        "temporaryLocalStreetAddress",
    ],
    "Gender": [
        "mies",
        "nainen",
    ],
    "HomeMunicipality": [
        "Alahärmä",
        "Anttola",
        "Ei kotikuntaa Suomessa",
        "ei tietoa",
        "Espoo",
        "Helsinki",
        "Hollola",
        "Hyvinkää",
        "Iisalmi",
        "Jyväskylä",
        "Jäppilä",
        "Järvenpää",
        "Karkkila",
        "Kotka",
        "Kuhmo",
        "Kuopio",
        "Lahti",
        "Laihia",
        "Lappeenranta",
        "Lohja",
        "Maarianhamina",
        "Masku",
        "Mikkeli",
        "Mynämäki",
        "Mäntsälä",
        "Nousiainen",
        "Nurmijärvi",
        "Oulu",
        "Pieksämäen mlk",
        "Pori",
        "Pornainen",
        "Pyhäselkä",
        "Rovaniemi",
        "Savonlinna",
        "Seinäjoki",
        "Tampere",
        "Tuntematon",
        "Turku",
        "Tuusula",
        "Ulkomaat",
        "Utsjoki",
        "Vaasa",
        "Vantaa",
        "Varkaus",
        "Vihti",
    ],
    "IdentificationMethod": [
        "ei tietoa",
        "kasvokkain",
    ],
    "MaritalStatus": [
        "asumuserossa",
        "avioliitossa",
        "ei tietoa",
        "eronnut",
        "eronnut rekisteröidystä parisuhteesta",
        "leski",
        "leski rekisteröidystä parisuhteesta",
        "naimaton",
        "rekisteröidyssä parisuhteessa",
    ],
    "Nationality": [
        "Angola",
        "Ankkalinna",
        "Appelsiinisaaret",
        "Argentiina",
        "Australia",
        "Bahama",
        "Bahrain",
        "Barbados",
        "Bhutan",
        "Bosnia-Hertsegovina",
        "Botswana",
        "Brasilia",
        "Brunei",
        "Ei selvit",
        "Ei tiedossa (M)",
        "ei tietoa",
        "Ghana",
        "Irlanti",
        "Italia",
        "Jemen Kd Tv",
        "Jugoslavia",
        "* Juku mikä maa *",
        "Kanada",
        "Kaukomaat",
        "Kiina",
        "KOSOVO",
        "Koulutustestivaltio",
        "Kreikka",
        "Marokko",
        "Neuvostoliitto",
        "Norja",
        "Oma valtio",
        "Ranska",
        "Reunion",
        "Ruotsi",
        "Saaret",
        "Saksa",
        "Saksa Dem Tv",
        "Seleväkielinen",
        "Serbia ja Montenegro",
        "Suomi",
        "Sveitsi",
        "Tanska",
        "Tsekki",
        "Tuntematon",
        "Unkari",
        "Venäjä",
        "Viro",
        "Yhdysvallat",
    ],
    "PrimaryLanguage": [
        "abhaasi",
        "adangme",
        "arabia",
        "baski, euskara",
        "ei tietoa",
        "englanti",
        "eteläsaame",
        "iiri",
        "italia",
        "kanuri",
        "koltansaame",
        "kreikka",
        "norja",
        "pohjoissaame",
        "portugali",
        "ranska",
        "ruotsi",
        "saamelaiskieli",
        "saksa",
        "slaavilainen kieli",
        "suomalainen viittomakieli",
        "suomi",
        "tanska",
        "tuntematon",
        "venäjä",
        "viittomakieli",
        "viro, eesti",
        "zhuang",
    ],
    "Source": [
        "VTJ",
    ],
};
