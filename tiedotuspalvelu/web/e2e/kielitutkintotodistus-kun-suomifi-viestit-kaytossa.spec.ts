import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import {
  reset,
  createTiedote,
  generateOpiskeluoikeusOid,
  OPPIJANUMERO_NORDEA_DEMO,
  runFetchOppijaTask,
  downloadReportAndFindLine,
  runSendSuomiFiViestitTask,
} from "./test-helpers";

test.beforeAll(async ({ request }) => {
  await reset(request);
});

test("Kielitutkintotodistus - Suomi.fi-viestit käytössä", async ({
  page,
  request,
}) => {
  const todistusUuid = randomUUID();
  const tiedoteApiResponse = await test.step("Tiedote luodaan", async () => {
    return await createTiedote(request, {
      oppijanumero: OPPIJANUMERO_NORDEA_DEMO,
      idempotencyKey: randomUUID(),
      todistusBucket: "bucket",
      todistusKey: `${todistusUuid}/todistus.pdf`,
      opiskeluoikeusOid: await generateOpiskeluoikeusOid(request),
    });
  });

  await test.step("Virkailija näkee tiedoteen rapsalla", async () => {
    await page.goto("/tiedotuspalvelu/");
    await page.getByRole("button", { name: "Tiina Tiedottaja" }).click();
    await expect(
      page.getByRole("button", { name: "Lataa kaikki tiedotteet CSV:nä" }),
    ).toBeVisible();

    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toMatchObject({
      "Tiedotteen vastaanottajan oppijanumero": OPPIJANUMERO_NORDEA_DEMO,
      "Tiedotteen käsittelyn tila tiedotuspalvelussa": "OPPIJAN_VALIDOINTI",
      "Kielitutkintotodistuksen S3 URL": `s3://bucket/${todistusUuid}/todistus.pdf`,
    });
    await runFetchOppijaTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toMatchObject({
      "Tiedotteen käsittelyn tila tiedotuspalvelussa":
        "SUOMIFI_VIESTIN_LÄHETYS",
    });
    await runSendSuomiFiViestitTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toMatchObject({
      "Tiedotteen käsittelyn tila tiedotuspalvelussa": "TIEDOTE_KÄSITELTY",
    });
  });

  await test.step("Oppija näkee tiedotteen omat-viestit sivulla", async () => {
    await page.goto("/omat-viestit/");
    await page
      .getByRole("button", { name: "Nordea Demo (210281-9988)" })
      .click();
    await expect(
      page.getByText(
        "Opetushallitus on myöntänyt sinulle todistuksen yleisestä kielitutkinnosta",
        { exact: false },
      ),
    ).toBeVisible();

    await test.step("todistuslinkki vie Kosken omat tiedot näkymään", async () => {
      const linkki = page.getByRole("link", {
        name: "https://opintopolku.fi/koski/omattiedot",
      });
      const hreffi = await linkki.getAttribute("href");
      await expect(hreffi).toBe("/koski/omattiedot");
    });
  });
});
