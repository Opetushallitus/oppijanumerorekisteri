import { Page } from '@playwright/test';

export const toastWithText = (page: Page, text: string) => page.locator('.oph-ds-toast').filter({ hasText: text });

export const selectLocator = (page: Page, selector: string) => {
    const select = async (s: string) => {
        await page.locator(selector).pressSequentially(s);
        await page.waitForTimeout(400);
        await page.keyboard.press('Enter');
    };

    const clickAndSelectNoWait = async (s: string) => {
        await page.locator(selector).click();
        await page.locator(selector).pressSequentially(s);
        await page.keyboard.press('Enter');
    };

    return {
        locator: page.locator(selector),
        select,
        clickAndSelectNoWait,
    };
};

export const kayttooikeusryhmaSelectModal = (page: Page) => {
    return {
        kayttooikeus: (name: string) => page.getByRole('button', { name }),
        close: page.locator('button[title="Close"]'),
        lisaa: page.getByRole('button', { name: 'Lisää haettaviin käyttöoikeuksiin' }),
    };
};

export const hakaTunnus = (page: Page) => {
    return {
        tunnukset: page.getByRole('dialog', { name: 'Haka-tunnukset' }).getByTestId('haka-tunnukset').locator('div'),
        get: (i: number) => {
            const row = page.getByTestId('haka-tunnukset').locator(`div:nth-child(${i})`);
            return {
                tunniste: row.locator('span'),
                remove: row.locator('button'),
            };
        },
        input: page.getByLabel('Lisää uusi Haka-tunnus'),
        submit: page.getByRole('button', { name: 'Tallenna tunnus' }),
    };
};
