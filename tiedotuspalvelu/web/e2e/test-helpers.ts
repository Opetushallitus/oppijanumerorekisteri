import { APIRequestContext, expect, Page } from "@playwright/test";
import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";

export const OPPIJANUMERO_NORDEA_DEMO = "1.2.246.562.24.73833272757";
export const OPPIJANUMERO_HELLIN_SEVILLANTES = "1.2.246.562.98.19783284870";
export const OPPIJANUMERO_SEVILLANTES_HENNAKARINA =
  "1.2.246.562.98.77340099611";

export async function reset(request: APIRequestContext) {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
}

export async function runFetchOppijaTask(request: APIRequestContext) {
  const response = await request.post("/test/runFetchOppijaTask");
  expect(response.ok()).toBeTruthy();
}
export async function runSendSuomiFiViestitTask(request: APIRequestContext) {
  const response = await request.post("/test/runSendSuomiFiViestitTask");
  expect(response.ok()).toBeTruthy();
}
export async function runFetchKielitutkintotodistusTask(
  request: APIRequestContext,
) {
  const response = await request.post(
    "/test/runFetchKielitutkintotodistusTask",
  );
  expect(response.ok()).toBeTruthy();
}

export type TiedoteDto = {
  oppijanumero: string;
  idempotencyKey: string;
  todistusBucket: string;
  todistusKey: string;
  opiskeluoikeusOid: string;
};

export async function createTiedote(
  request: APIRequestContext,
  body: TiedoteDto,
): Promise<any> {
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
    "/omat-viestit/api/v1/tiedote/kielitutkintotodistus",
    {
      headers: { Authorization: `Bearer ${access_token}` },
      data: body,
    },
  );
  expect(createResponse.ok()).toBeTruthy();
  return await createResponse.json();
}

export async function generateOpiskeluoikeusOid(request: APIRequestContext) {
  const response = await request.post("/test/generateOpiskeluoikeusOid");
  const jason = await response.json();
  return jason.oid;
}
export async function downloadReportAndFindLine(
  page: Page,
  tiedoteId: string,
): Promise<Record<string, string>> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Lataa kaikki tiedotteet CSV:nä" })
      .click(),
  ]);
  const csvString = await readFile(await download.path()!, "utf-8");
  const lines: Record<string, string>[] = parse(csvString, {
    columns: true,
    delimiter: ";",
  });
  const tiedoteLine = lines.find((_) => _["Tiedotteen ID"] === tiedoteId);
  return expectDefined(tiedoteLine);
}

function expectDefined<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is not defined");
  }
  return value;
}
