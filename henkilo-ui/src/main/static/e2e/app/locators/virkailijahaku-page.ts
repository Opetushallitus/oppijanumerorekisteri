import { Page } from '@playwright/test';

export async function gotoVirkailijahaku(page: Page) {
    await page.goto('/henkilo-ui/virkailijahaku');
    const selectLocator = (id: string) => {
        return {
            locator: page.locator(id),
            select: async (s: string) => {
                await page.locator(id).type(s);
                await page.waitForTimeout(400);
                await page.keyboard.press('Enter');
            },
        };
    };
    return {
        filters: {
            nameQuery: page.getByLabel('Hakutermi (sukunimi, etunimi, käyttäjätunnus tai henkilön OID)'),
            organisaatioSelect: selectLocator('#organisaatio-select'),
            ryhmaSelect: selectLocator('#ryhma-select'),
            kayttooikeusryhma: selectLocator('#kayttooikeusryhma-select'),
            subOrganisationsCheckbox: page.locator('#subOrganisations'),
            subOrganisationsLabel: page.getByText('Aliorganisaatioista'),
        },
        results: {
            count: page.getByTestId('virkailijaa-count'),
            get: (i: number) => {
                const row = page.locator(`tbody tr:nth-child(${i})`);
                return {
                    name: row.locator('a'),
                    username: row.locator('span'),
                    organisations: row.locator('ul'),
                };
            },
        },
    };
}
