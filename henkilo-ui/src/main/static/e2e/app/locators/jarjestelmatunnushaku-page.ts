import { Page } from '@playwright/test';

import { selectLocator } from '../../locators';

export async function gotoJarjestelmatunnushaku(page: Page) {
    await page.goto('/henkilo-ui/jarjestelmatunnus');

    return {
        filters: {
            nameQuery: page.getByLabel('Suodata palvelun nimellä'),
            organisaatioSelect: selectLocator(page, '#organisaatio-select'),
            kayttooikeusryhma: selectLocator(page, '#kayttooikeusryhma-select'),
            subOrganisationsCheckbox: page.locator('#subOrganisations'),
            subOrganisationsLabel: page.getByText('Aliorganisaatioista'),
        },
        results: {
            count: page.getByTestId('järjestelmätunnusta-count'),
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
