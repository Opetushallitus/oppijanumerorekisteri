import { Page } from '@playwright/test';

export async function gotoKayttooikeusryhmat(page: Page) {
    await page.goto('/henkilo-ui/kayttooikeusryhmat');
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
            palveluSelect: selectLocator('#palvelu-select'),
            kayttooikeusSelect: selectLocator('#kayttooikeus-select'),
        },
    };
}
