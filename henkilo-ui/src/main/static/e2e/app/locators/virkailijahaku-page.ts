import { Page } from '@playwright/test';

import { selectLocator } from '../../locators';

export async function gotoVirkailijahaku(page: Page) {
    await page.goto('/henkilo-ui/virkailijahaku');

    return {
        filters: {
            nameQuery: page.getByLabel('Hakutermi (sukunimi, etunimi, käyttäjätunnus tai henkilön OID)'),
            organisaatioSelect: selectLocator(page, '#organisaatio-select'),
            ryhmaSelect: selectLocator(page, '#ryhma-select'),
            kayttooikeusryhma: selectLocator(page, '#kayttooikeusryhma-select'),
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
