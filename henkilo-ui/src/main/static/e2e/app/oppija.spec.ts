import { expect, test } from '@playwright/test';

test.describe('oppija view', () => {
    test('shows basic information', async ({ page }) => {
        const testiaineistoGretaOid = '1.2.246.562.98.24707445854';
        await page.goto(`/henkilo-ui/oppija/${testiaineistoGretaOid}?permissionCheckService=ATARU`);
        await expect(page.locator('div#HENKILO_ETUNIMET span.field')).toHaveText('Greta');
        await expect(page.locator('div#HENKILO_SUKUNIMI span.field')).toHaveText('Denimman');
    });
});
