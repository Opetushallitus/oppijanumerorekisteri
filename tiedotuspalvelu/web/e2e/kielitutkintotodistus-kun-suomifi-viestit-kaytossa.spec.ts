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
  const tiedoteApiResponse = await test.step("Tiedote luodaan", async () => {
    return await createTiedote(request, {
      oppijanumero: OPPIJANUMERO_NORDEA_DEMO,
      idempotencyKey: randomUUID(),
      todistusUrl: `s3://bucket/${randomUUID()}.pdf`,
      opiskeluoikeusOid: await generateOpiskeluoikeusOid(request),
    });
  });

  await test.step("Virkailija näkee tiedoteen rapsalla", async () => {
    await page.goto("/tiedotuspalvelu/");
    await page.getByRole("button", { name: "Tiina Tiedottaja" }).click();
    await expect(
      page.getByRole("button", { name: "Kirjaudu ulos" }),
    ).toBeVisible();

    const tiedoteLine = await downloadReportAndFindLine(
      page,
      tiedoteApiResponse.id,
    );
    expect(tiedoteLine).toContain(OPPIJANUMERO_NORDEA_DEMO);
    expect(tiedoteLine).toContain("OPPIJAN_VALIDOINTI");
    await runFetchOppijaTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toContain("SUOMIFI_VIESTIN_LÄHETYS");
    await runSendSuomiFiViestitTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toContain("TIEDOTE_KÄSITELTY");
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
