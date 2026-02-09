import { test, expect, Page } from '@playwright/test';

import { type SpringPage, OppijahakuResult, OppijahakuCriteria } from '../../src/api/oppijanumerorekisteri';
import { gotoOppijahaku } from './locators/oppijahaku-page';

test.describe('oppijahaku', () => {
    const mockOppijahaku = async (
        page: Page,
        validator: (criteria: OppijahakuCriteria) => boolean,
        response: SpringPage<OppijahakuResult>
    ) => {
        await page.route('/oppijanumerorekisteri-service/internal/oppijahaku', async (route, request) => {
            if (validator(request.postDataJSON())) {
                await route.fulfill({
                    json: response,
                });
            } else {
                await route.fulfill({ json: [] });
            }
        });
    };

    test('haku by name and passivoidut', async ({ page }) => {
        const { filters, results } = await gotoOppijahaku(page);
        await expect(results.count).toHaveText('Hakutulos (0 oppijaa)');

        await mockOppijahaku(page, (c) => c.query === 'pasi' && c.page === 0 && c.passive === false, {
            content: [
                {
                    oid: '1.2.246.562.99.45262572456',
                    etunimet: 'pasi ville',
                    sukunimi: 'la',
                    syntymaaika: '1934-01-13',
                },
            ],
            page: {
                size: 2,
                number: 0,
                totalElements: 1,
                totalPages: 1,
            },
        });

        await filters.query.fill('pasi');
        await expect(results.count).toHaveText('Hakutulos (1 oppijaa)');

        await expect(results.get(1).name).toHaveText('la, pasi ville');
        await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572456');
        await expect(results.get(1).syntymaaika).toHaveText('13.1.1934');

        await mockOppijahaku(page, (c) => c.query === 'pasi' && c.page === 0 && c.passive === true, {
            content: [
                {
                    oid: '1.2.246.562.99.45262572456',
                    etunimet: 'pasi ville',
                    sukunimi: 'la',
                    syntymaaika: '1934-01-13',
                },
                {
                    oid: '1.2.246.562.99.45262572345',
                    etunimet: 'masi',
                    sukunimi: 'pasila',
                    syntymaaika: '1954-10-07',
                },
            ],
            page: {
                size: 2,
                number: 0,
                totalElements: 2,
                totalPages: 1,
            },
        });

        await filters.passivoidut.click();
        await expect(results.count).toHaveText('Hakutulos (2 oppijaa)');

        await expect(results.get(1).name).toHaveText('la, pasi ville');
        await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572456');
        await expect(results.get(1).syntymaaika).toHaveText('13.1.1934');

        await expect(results.get(2).name).toHaveText('pasila, masi');
        await expect(results.get(2).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572345');
        await expect(results.get(2).syntymaaika).toHaveText('7.10.1954');
    });

    test('pagination', async ({ page }) => {
        const { filters, results, pagination } = await gotoOppijahaku(page);
        await expect(results.count).toHaveText('Hakutulos (0 oppijaa)');

        await test.step('first page', async () => {
            await mockOppijahaku(page, (c) => c.query === 'pasi' && c.page === 0 && c.passive === false, {
                content: [
                    {
                        oid: '1.2.246.562.99.45262572456',
                        etunimet: 'pasi ville',
                        sukunimi: 'la',
                        syntymaaika: '1934-01-13',
                    },
                ],
                page: {
                    size: 1,
                    number: 0,
                    totalElements: 50,
                    totalPages: 50,
                },
            });

            await filters.query.fill('pasi');
            await expect(results.count).toHaveText('Hakutulos (50 oppijaa)');

            await expect(pagination.page(1)).toHaveAttribute('aria-current', 'page');
            await expect(pagination.previous).toBeDisabled();

            await expect(results.get(1).name).toHaveText('la, pasi ville');
            await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572456');
            await expect(results.get(1).syntymaaika).toHaveText('13.1.1934');
        });

        await test.step('click page 2', async () => {
            await mockOppijahaku(page, (c) => c.query === 'pasi' && c.page === 1 && c.passive === false, {
                content: [
                    {
                        oid: '1.2.246.562.99.45262572345',
                        etunimet: 'masi',
                        sukunimi: 'pasila',
                        syntymaaika: '1954-10-07',
                    },
                ],
                page: {
                    size: 1,
                    number: 1,
                    totalElements: 50,
                    totalPages: 50,
                },
            });

            await pagination.page(2).click();

            await expect(results.get(1).name).toHaveText('pasila, masi');
            await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572345');
            await expect(results.get(1).syntymaaika).toHaveText('7.10.1954');

            await expect(pagination.page(2)).toHaveAttribute('aria-current', 'page');
        });

        await test.step('click previous', async () => {
            await pagination.previous.click();

            await expect(results.get(1).name).toHaveText('la, pasi ville');
            await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572456');
            await expect(results.get(1).syntymaaika).toHaveText('13.1.1934');

            await expect(pagination.page(1)).toHaveAttribute('aria-current', 'page');
        });

        await test.step('click next', async () => {
            await pagination.next.click();

            await expect(results.get(1).name).toHaveText('pasila, masi');
            await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/oppija2/1.2.246.562.99.45262572345');
            await expect(results.get(1).syntymaaika).toHaveText('7.10.1954');

            await expect(pagination.page(2)).toHaveAttribute('aria-current', 'page');
        });
    });
});
