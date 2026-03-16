import { test, expect, APIRequestContext } from "@playwright/test";
import { randomUUID } from "crypto";

const OPPIJANUMERO_NORDEA_DEMO = "1.2.246.562.24.73833272757";

test.beforeAll(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("Kielitutkintotodistus happy path", async ({ page, request }) => {
  await test.step("Tiedote luodaan", async () => {
    await createTiedote(request, {
      oppijanumero: OPPIJANUMERO_NORDEA_DEMO,
      idempotencyKey: randomUUID(),
      todistusUrl: `s3://bucket/${randomUUID()}.pdf`,
      opiskeluoikeusOid: await generateOpiskeluoikeusOid(request),
    });
  });

  await test.step("Virkailija näkee tiedoteen rapsasivulla", async () => {
    await page.goto("/tiedotuspalvelu/");
    await page.getByRole("button", { name: "Whiskers Meowington" }).click();
    await expect(page.locator("span.tp__user")).toBeVisible();

    const table = page.locator("table.tp__table");
    await expect(
      table.locator("tbody tr", { hasText: OPPIJANUMERO_NORDEA_DEMO }),
    ).toBeVisible();
  });

  await test.step("Oppija näkee tiedotteen omat-viestit sivulla", async () => {
    await page.goto("/omat-viestit/");
    await page
      .getByRole("button", { name: "Nordea Demo (210281-9988)" })
      .click();
    await expect(
      page.getByText(
        "Olet suorittanut kielitutkinnon, voit ladata todistuksen täältä",
      ),
    ).toBeVisible();

    await test.step("todistuslinkki vie Kosken omat tiedot näkymään", async () => {
      const linkki = page.getByRole("link", { name: "täältä" });
      const hreffi = await linkki.getAttribute("href");
      await expect(hreffi).toBe("/koski/omattiedot");
    });
  });
});

type TiedoteDto = {
  oppijanumero: string;
  idempotencyKey: string;
  todistusUrl: string;
  opiskeluoikeusOid: string;
};
async function createTiedote(request: APIRequestContext, body: TiedoteDto) {
  const tokenResponse = await request.post(
    "http://localhost:8888/realms/otuva-oauth2/protocol/openid-connect/token",
    {
      form: {
        grant_type: "client_credentials",
        client_id: "kielitutkinnosta-tiedottaja",
        client_secret: "kielitutkinnosta-tiedottaja",
      },
    },
  );
  expect(tokenResponse.ok()).toBeTruthy();
  const { access_token } = await tokenResponse.json();

  const createResponse = await request.post(
    "http://localhost:8088/omat-viestit/api/v1/tiedote/kielitutkintotodistus",
    {
      headers: { Authorization: `Bearer ${access_token}` },
      data: body,
    },
  );
  expect(createResponse.ok()).toBeTruthy();
}

async function generateOpiskeluoikeusOid(request: APIRequestContext) {
  const response = await request.post(
    "http://localhost:8088/test/generateOpiskeluoikeusOid",
  );
  const jason = await response.json();
  return jason.oid;
}
