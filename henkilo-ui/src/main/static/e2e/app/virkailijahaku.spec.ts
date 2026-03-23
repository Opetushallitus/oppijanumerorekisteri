import { test, expect, Page } from '@playwright/test';

import { gotoVirkailijahaku } from './locators/virkailijahaku-page';

import { type HenkilohakuResult } from '../../src/types/domain/kayttooikeus/HenkilohakuResult.types';

test.describe('virkailijahaku', () => {
    const mockVirkailijahaku = async (
        page: Page,
        validator: (criteria: any) => boolean,
        response: HenkilohakuResult[]
    ) => {
        await page.route('/kayttooikeus-service/internal/virkailijahaku', async (route, request) => {
            if (validator(request.postDataJSON())) {
                await route.fulfill({
                    json: response,
                });
            } else {
                await route.fulfill({ json: [] });
            }
        });
    };

    test('haku by name', async ({ page }) => {
        const { filters, results } = await gotoVirkailijahaku(page);
        await expect(results.count).toHaveText('0 virkailijaa');

        await mockVirkailijahaku(page, (c) => c.nameQuery === 'pasi', [
            {
                oidHenkilo: '1.2.246.562.99.45262572456',
                kayttajatunnus: 'username1',
                organisaatioNimiList: [],
                nimi: 'Pasinen, Vesa',
            },
            {
                oidHenkilo: '1.2.246.562.99.32462346235',
                kayttajatunnus: 'username2',
                organisaatioNimiList: [
                    {
                        identifier: '1.2.246.562.98.2341452346',
                        tyypit: ['organisaatiotyyppi_01', 'organisaatiotyyppi_02'],
                        localisedLabels: {
                            sv: 'Koulun kannatusyhdistys',
                            fi: 'Koulun kannatusyhdistys',
                            en: 'Koulun kannatusyhdistys',
                        },
                    },
                ],
                nimi: 'Lapas, Pasi',
            },
        ]);

        await filters.nameQuery.fill('pasi');
        await expect(results.count).toHaveText('2 virkailijaa');

        await expect(results.get(1).name).toHaveText('Lapas, Pasi');
        await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/virkailija/1.2.246.562.99.32462346235');
        await expect(results.get(1).username).toHaveText('username2');
        await expect(results.get(1).organisations).toHaveText('Koulun kannatusyhdistys (KOULU,OPPILAITOS)');

        await expect(results.get(2).name).toHaveText('Pasinen, Vesa');
        await expect(results.get(2).name).toHaveAttribute('href', '/henkilo-ui/virkailija/1.2.246.562.99.45262572456');
        await expect(results.get(2).username).toHaveText('username1');
        await expect(results.get(2).organisations).toHaveText('');
    });

    test('haku by organisaatio', async ({ page }) => {
        const { filters, results } = await gotoVirkailijahaku(page);
        await expect(results.count).toHaveText('0 virkailijaa');

        await test.step('excluding suborganisations', async () => {
            await mockVirkailijahaku(
                page,
                (c) => c.organisaatioOids[0] === '1.2.246.562.98.52356235613' && !c.subOrganisation,
                [
                    {
                        oidHenkilo: '1.2.246.562.99.75346352345',
                        kayttajatunnus: 'username3',
                        organisaatioNimiList: [],
                        nimi: 'Kojootti, Keijo',
                    },
                ]
            );

            await expect(filters.subOrganisationsCheckbox).toBeDisabled();
            await filters.organisaatioSelect.select('aliorg');
            await expect(results.count).toHaveText('1 virkailijaa');
            await expect(filters.ryhmaSelect.locator).toBeDisabled();

            await expect(results.get(1).name).toHaveText('Kojootti, Keijo');
            await expect(results.get(1).name).toHaveAttribute(
                'href',
                '/henkilo-ui/virkailija/1.2.246.562.99.75346352345'
            );
            await expect(results.get(1).username).toHaveText('username3');
            await expect(results.get(1).organisations).toHaveText('');
        });

        await test.step('including suborganisations', async () => {
            await mockVirkailijahaku(
                page,
                (c) => c.organisaatioOids[0] === '1.2.246.562.98.52356235613' && c.subOrganisation,
                [
                    {
                        oidHenkilo: '1.2.246.562.99.75346352345',
                        kayttajatunnus: 'username3',
                        organisaatioNimiList: [],
                        nimi: 'Kojootti, Keijo',
                    },
                    {
                        oidHenkilo: '1.2.246.562.99.64354357473',
                        kayttajatunnus: 'username4',
                        organisaatioNimiList: [],
                        nimi: 'Sorsa, Roope',
                    },
                ]
            );

            await expect(filters.subOrganisationsCheckbox).toBeEnabled();
            await filters.subOrganisationsLabel.click();
            await expect(results.count).toHaveText('2 virkailijaa');
            await expect(filters.ryhmaSelect.locator).toBeDisabled();

            await expect(results.get(1).name).toHaveText('Kojootti, Keijo');
            await expect(results.get(1).name).toHaveAttribute(
                'href',
                '/henkilo-ui/virkailija/1.2.246.562.99.75346352345'
            );
            await expect(results.get(1).username).toHaveText('username3');
            await expect(results.get(1).organisations).toHaveText('');

            await expect(results.get(2).name).toHaveText('Sorsa, Roope');
            await expect(results.get(2).name).toHaveAttribute(
                'href',
                '/henkilo-ui/virkailija/1.2.246.562.99.64354357473'
            );
            await expect(results.get(2).username).toHaveText('username4');
            await expect(results.get(2).organisations).toHaveText('');
        });
    });

    test('haku by ryhma', async ({ page }) => {
        const { filters, results } = await gotoVirkailijahaku(page);
        await expect(results.count).toHaveText('0 virkailijaa');

        await mockVirkailijahaku(page, (c) => c.organisaatioOids[0] === '1.2.246.562.28.56456734773', [
            {
                oidHenkilo: '1.2.246.562.99.45262572456',
                kayttajatunnus: 'username1',
                organisaatioNimiList: [],
                nimi: 'Pasinen, Vesa',
            },
        ]);

        await filters.ryhmaSelect.select('ryhma1');
        await expect(results.count).toHaveText('1 virkailijaa');
        await expect(filters.organisaatioSelect.locator).toBeDisabled();
        await expect(filters.subOrganisationsCheckbox).toBeDisabled();

        await expect(results.get(1).name).toHaveText('Pasinen, Vesa');
        await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/virkailija/1.2.246.562.99.45262572456');
        await expect(results.get(1).username).toHaveText('username1');
        await expect(results.get(1).organisations).toHaveText('');
    });

    test('haku by käyttöoikeusryhmä', async ({ page }) => {
        const { filters, results } = await gotoVirkailijahaku(page);
        await expect(results.count).toHaveText('0 virkailijaa');

        await mockVirkailijahaku(page, (c) => c.kayttooikeusryhmaId === 4056628, [
            {
                oidHenkilo: '1.2.246.562.99.75346352345',
                kayttajatunnus: 'username3',
                organisaatioNimiList: [],
                nimi: 'Kojootti, Keijo',
            },
        ]);

        await filters.kayttooikeusryhma.select('kuvaus3');
        await expect(results.count).toHaveText('1 virkailijaa');

        await expect(results.get(1).name).toHaveText('Kojootti, Keijo');
        await expect(results.get(1).name).toHaveAttribute('href', '/henkilo-ui/virkailija/1.2.246.562.99.75346352345');
        await expect(results.get(1).username).toHaveText('username3');
        await expect(results.get(1).organisations).toHaveText('');
    });

    test('suborganisations is disabled if root organisation is chosen', async ({ page }) => {
        const { filters, results } = await gotoVirkailijahaku(page);
        await expect(results.count).toHaveText('0 virkailijaa');

        await mockVirkailijahaku(
            page,
            (c) => c.organisaatioOids[0] === '1.2.246.562.10.00000000001' && !c.subOrganisation,
            [
                {
                    oidHenkilo: '1.2.246.562.99.75346352345',
                    kayttajatunnus: 'username3',
                    organisaatioNimiList: [],
                    nimi: 'Kojootti, Keijo',
                },
            ]
        );

        await expect(filters.subOrganisationsCheckbox).toBeDisabled();
        await filters.organisaatioSelect.select('root');
        await expect(results.count).toHaveText('1 virkailijaa');

        await expect(filters.subOrganisationsCheckbox).toBeDisabled();
    });
});
