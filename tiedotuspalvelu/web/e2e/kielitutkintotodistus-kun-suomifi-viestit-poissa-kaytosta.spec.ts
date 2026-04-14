import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import {
  createTiedote,
  reset,
  OPPIJANUMERO_SEVILLANTES_HENNAKARINA,
  generateOpiskeluoikeusOid,
  runSendSuomiFiViestitTask,
  runFetchOppijaTask,
  downloadReportAndFindLine,
  runFetchKielitutkintotodistusTask,
} from "./test-helpers";

test.beforeAll(async ({ request }) => {
  await reset(request);
});

test("Kielitutkintotodistus - Suomi.fi-viestit ei käytössä", async ({
  page,
  request,
}) => {
  const tiedoteApiResponse = await test.step("Tiedote luodaan", async () => {
    return await createTiedote(request, {
      oppijanumero: OPPIJANUMERO_SEVILLANTES_HENNAKARINA,
      idempotencyKey: randomUUID(),
      todistusBucket: "bucket",
      todistusKey: `${randomUUID()}/todistus.pdf`,
      opiskeluoikeusOid: await generateOpiskeluoikeusOid(request),
    });
  });

  await test.step("Virkailija näkee tiedoteen rapsalla", async () => {
    await page.goto("/tiedotuspalvelu/");
    await page.getByRole("button", { name: "Tiina Tiedottaja" }).click();
    await expect(
      page.getByRole("button", { name: "Lataa kaikki tiedottet CSV:nä" }),
    ).toBeVisible();

    const tiedoteLine = await downloadReportAndFindLine(
      page,
      tiedoteApiResponse.id,
    );
    expect(tiedoteLine).toContain(OPPIJANUMERO_SEVILLANTES_HENNAKARINA);
    expect(tiedoteLine).toContain("OPPIJAN_VALIDOINTI");
    await runFetchOppijaTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toContain("SUOMIFI_VIESTIN_LÄHETYS");
    await runSendSuomiFiViestitTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toContain("KIELITUTKINTOTODISTUKSEN_NOUTO");
    await runFetchKielitutkintotodistusTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toContain("SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA");
    await runSendSuomiFiViestitTask(request);
    expect(
      await downloadReportAndFindLine(page, tiedoteApiResponse.id),
    ).toContain("TIEDOTE_KÄSITELTY");
  });

  await test.step("Oppija näkee tiedotteen omat-viestit sivulla", async () => {
    await page.goto("/omat-viestit/");
    await page
      .getByRole("button", { name: "Hennakaarina Sevillantes (181064-998C)" })
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
