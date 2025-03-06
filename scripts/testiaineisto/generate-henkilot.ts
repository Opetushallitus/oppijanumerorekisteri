import * as fs from "fs";

import * as Henkilo from "./Henkilo";
import * as Maa from "./Maa";
import * as Kieli from "./Kieli";
import * as Kotikunta from "./Kotikunta";

const fetchKoodisto = async (koodisto: string) => {
  const k = await fetch(
    `https://virkailija.testiopintopolku.fi/koodisto-service/rest/json/${koodisto}/koodi`
  ).then((f) => f.text());
  return k;
};

const main = async () => {
  const henkilot = Henkilo.Convert.toHenkilo(
    fs.readFileSync("./testiaineisto.json", "utf8")
  );
  const maat = Maa.Convert.toMaa(await fetchKoodisto("maatjavaltiot2"));
  const kielet = Kieli.Convert.toKieli(await fetchKoodisto("kieli"));
  const kotikunnat = Kotikunta.Convert.toKotikunta(
    await fetchKoodisto("kotikunnat")
  );

  var invalidFields = 0;

  const getKotikunta = (kunta: string) => {
    if (
      !kunta ||
      kunta === "ei tietoa" ||
      kunta.startsWith("Ei ") ||
      kunta === "Ulkomaat"
    ) {
      return "";
    } else if (kunta === "Maarianhamina") {
      return "478";
    }

    const kuntakoodi =
      kotikunnat.find((k) => !!k.metadata.find((m) => m.nimi === kunta))
        ?.koodiArvo ?? "";
    if (!kuntakoodi) {
      console.log(`${++invalidFields}. kunta not found: ${kunta}`);
    }
    return kuntakoodi.padStart(3, "0");
  };

  const getAidinkieli = (language: string) => {
    if (!language || language === "ei tietoa" || language.startsWith("Ei ")) {
      return "";
    } else if (language === "viro, eesti") {
      return "ET";
    } else if (language === "saamelaiskieli" || language === "koltansaame") {
      return "SE";
    } else if (language.indexOf("viittomakieli")) {
      return "VK";
    }

    const kielikoodi =
      kielet.find((k) => !!k.metadata.find((m) => m.nimi === language))
        ?.koodiArvo ?? "";
    if (!kielikoodi) {
      console.log(`${++invalidFields}. kieli not found: ${language}`);
    }
    return kielikoodi;
  };

  const getKansalaisuudet = (meh: string[]) => {
    if (!meh.length || meh[0] === "ei tietoa" || meh[0].startsWith("Ei ")) {
      return "";
    }

    return meh
      .map((me) => {
        const maakoodi =
          maat.find(
            (k) =>
              !!k.metadata.find(
                (m) =>
                  m.nimi.toUpperCase() === me.toUpperCase() ||
                  m.nimi.toUpperCase() === `Entinen ${me}`.toUpperCase()
              )
          )?.koodiArvo ?? "";
        if (!maakoodi) {
          if (me === "Yhdysvallat") {
            return "840";
          } else if (me === "Tsekki") {
            return "203";
          } else if (me === "Bosnia-Hertsegovina") {
            return "070";
          }
          console.log(`${++invalidFields}. maa not found: ${me}`);
        }
        return maakoodi;
      })
      .filter((m) => !!m)
      .join(",");
  };

  const getDateOfDeath = (d: Henkilo.VtjData) => {
    const date = d.dateOfDeath ?? "";
    return date.replace(/-00/g, "-01");
  };

  const filtered = henkilot.filter((h) => h.code && h.vtjData);

  var content = "";
  content += "hetu;";
  content += "etunimet;";
  content += "sukunimi;";
  content += "syntymaaika;";
  content += "kuolinpaiva;";
  content += "sukupuoli;";
  content += "turvakielto;";
  content += "kotikunta;";
  content += "aidinkieli;";
  content += "kansalaisuudet;";
  content += "huoltajat;";
  content += "katuosoite;";
  content += "postinumero;";
  content += "kaupunki\n";

  filtered.forEach((h) => {
    const d = h.vtjData;
    const osoite = d?.addresses.find(
      (a) =>
        a.type === "permanentLocalStreetAddress" &&
        a.address &&
        a.postalCode &&
        a.postalDistrict
    );
    content += h.code + ";";
    content += d.firstNames + ";";
    content += d.lastName + ";";
    content += (d.birthday ? d.birthday.toISOString().split("T")[0] : "") + ";";
    content += getDateOfDeath(d) + ";";
    content += d.gender === "mies" ? "1;" : "2;";
    content += d.hasProtectionOrder + ";";
    content += getKotikunta(d.homeMunicipality) + ";";
    content += getAidinkieli(d.primaryLanguage) + ";";
    content += getKansalaisuudet(d.nationality) + ";";
    content +=
      (d.ownedPersonRoles
        ?.filter(
          (h) => h.ownerPerson && h.targetPerson && h.role === "dependent"
        )
        .map((h) => h.targetPerson)
        .join(",") ?? "") + ";";
    content += (osoite?.address ?? "") + ";";
    content += (osoite?.postalCode ?? "") + ";";
    content += (osoite?.postalDistrict ?? "") + "\n";
  });

  try {
    fs.writeFileSync("./henkilot.csv", content);
  } catch (err) {
    console.log(err);
  }
};

main();
