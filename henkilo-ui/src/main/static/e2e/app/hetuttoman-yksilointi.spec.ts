import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

import henkilo from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/__oid__/GET.json';

test.describe('hetuttoman yksilointi', () => {
    const hetuttomanYksilointiTest = async (page: Page, henkiloData: Record<string, unknown>) => {
        await page.route('/oppijanumerorekisteri-service/henkilo/1.2.3.4.5', async (route) => {
            await route.fulfill({
                json: {
                    ...henkilo,
                    yksiloity: false,
                    ...henkiloData,
                },
            });
        });
        await page.goto('/oppija/1.2.3.4.5');
        await page.getByText('Yksilöi ilman hetua').click();
        await page.getByText('Vahvista yksilöinti').click();
    };

    test('fails if henkilo is missing etunimet', async ({ page }) => {
        await hetuttomanYksilointiTest(page, { etunimet: null });
        await expect(page.getByText('Yksilöintiä ei voitu suorittaa')).toBeVisible();
    });

    test('fails if henkilo is missing sukunimi', async ({ page }) => {
        await hetuttomanYksilointiTest(page, { sukunimi: null });
        await expect(page.getByText('Yksilöintiä ei voitu suorittaa')).toBeVisible();
    });

    test('fails if henkilo is missing kutsumanimi', async ({ page }) => {
        await hetuttomanYksilointiTest(page, { etunimet: null });
        await expect(page.getByText('Yksilöintiä ei voitu suorittaa')).toBeVisible();
    });

    test('fails if henkilo is missing syntymäaika', async ({ page }) => {
        await hetuttomanYksilointiTest(page, { syntymaaika: null });
        await expect(page.getByText('Yksilöintiä ei voitu suorittaa')).toBeVisible();
    });

    test('fails if henkilo is missing sukupuoli', async ({ page }) => {
        await hetuttomanYksilointiTest(page, { sukupuoli: null });
        await expect(page.getByText('Yksilöintiä ei voitu suorittaa')).toBeVisible();
    });

    test('fails if henkilo is missing äidinkieli', async ({ page }) => {
        await hetuttomanYksilointiTest(page, { aidinkieli: null });
        await expect(page.getByText('Yksilöintiä ei voitu suorittaa')).toBeVisible();
    });
});
