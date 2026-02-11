import { Page } from '@playwright/test';

import { selectLocator } from '../../locators';

export async function gotoKayttooikeusryhmat(page: Page) {
    await page.goto('/henkilo-ui/kayttooikeusryhmat');
    return {
        filters: {
            palveluSelect: selectLocator(page, '#palvelu-select'),
            kayttooikeusSelect: selectLocator(page, '#kayttooikeus-select'),
        },
    };
}
