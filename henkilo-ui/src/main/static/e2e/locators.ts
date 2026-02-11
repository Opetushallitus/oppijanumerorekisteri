import { Page } from '@playwright/test';

export const toastWithText = (page: Page, text: string) => page.locator('.oph-ds-toast').filter({ hasText: text });

export const selectLocator = (page: Page, id: string) => {
    return {
        locator: page.locator(id),
        select: async (s: string) => {
            await page.locator(id).type(s);
            await page.waitForTimeout(400);
            await page.keyboard.press('Enter');
        },
    };
};
