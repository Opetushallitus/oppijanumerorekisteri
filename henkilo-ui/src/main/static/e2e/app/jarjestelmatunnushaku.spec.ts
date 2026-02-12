import { test, expect, Page } from '@playwright/test';

import { gotoJarjestelmatunnushaku } from './locators/jarjestelmatunnushaku-page';

import { type HenkilohakuResult } from '../../src/types/domain/kayttooikeus/HenkilohakuResult.types';

test.describe('virkailijahaku', () => {
    const mockVirkailijahaku = async (
        page: Page,
        validator: (criteria: any) => boolean,
        response: HenkilohakuResult[]
    ) => {
        await page.route('/kayttooikeus-service/internal/jarjestelmatunnushaku', async (route, request) => {
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
        const { filters, results } = await gotoJarjestelmatunnushaku(page);
        await expect(results.count).toHaveText('Hakutulos (0 järjestelmätunnusta)');

        await mockVirkailijahaku(page, (c) => c.nameQuery === 'pasi', [
            {
                oidHenkilo: '1.2.246.562.99.45262572456',
                kayttajatunnus: 'pasipesu',
                organisaatioNimiList: [],
                nimi: 'pasilan autopesu, _',
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
                nimi: 'pasin palvelu, _',
            },
        ]);

        await filters.nameQuery.fill('pasi');
        await expect(results.count).toHaveText('Hakutulos (2 järjestelmätunnusta)');

        await expect(results.get(1).name).toHaveText('pasilan autopesu');
        await expect(results.get(1).name).toHaveAttribute(
            'href',
            '/henkilo-ui/jarjestelmatunnus/1.2.246.562.99.32462346235'
        );
        await expect(results.get(1).username).toHaveText('pasipesu');
        await expect(results.get(1).organisations).toHaveText('');

        await expect(results.get(2).name).toHaveText('pasin palvelu');
        await expect(results.get(2).name).toHaveAttribute(
            'href',
            '/henkilo-ui/jarjestelmatunnus/1.2.246.562.99.45262572456'
        );
        await expect(results.get(2).username).toHaveText('username2');
        await expect(results.get(2).organisations).toHaveText('Koulun kannatusyhdistys (KOULU,OPPILAITOS)');
    });

    test('haku by organisaatio', async ({ page }) => {
        const { filters, results } = await gotoJarjestelmatunnushaku(page);
        await expect(results.count).toHaveText('Hakutulos (0 järjestelmätunnusta)');

        await test.step('excluding suborganisations', async () => {
            await mockVirkailijahaku(
                page,
                (c) => c.organisaatioOids[0] === '1.2.246.562.98.52356235613' && !c.subOrganisation,
                [
                    {
                        oidHenkilo: '1.2.246.562.99.75346352345',
                        kayttajatunnus: 'username3',
                        organisaatioNimiList: [],
                        nimi: 'koulun exceli, _',
                    },
                ]
            );

            await expect(filters.subOrganisationsCheckbox).toBeDisabled();
            await filters.organisaatioSelect.select('aliorg');
            await expect(results.count).toHaveText('Hakutulos (1 järjestelmätunnusta)');

            await expect(results.get(1).name).toHaveText('koulun exceli');
            await expect(results.get(1).name).toHaveAttribute(
                'href',
                '/henkilo-ui/jarjestelmatunnus/1.2.246.562.99.75346352345'
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
                        nimi: 'valintapalvelu, _',
                    },
                    {
                        oidHenkilo: '1.2.246.562.99.64354357473',
                        kayttajatunnus: 'username4',
                        organisaatioNimiList: [],
                        nimi: 'valtion palvelu, _',
                    },
                ]
            );

            await expect(filters.subOrganisationsCheckbox).toBeEnabled();
            await filters.subOrganisationsLabel.click();
            await expect(results.count).toHaveText('Hakutulos (2 järjestelmätunnusta)');

            await expect(results.get(1).name).toHaveText('valintapalvelu');
            await expect(results.get(1).name).toHaveAttribute(
                'href',
                '/henkilo-ui/jarjestelmatunnus/1.2.246.562.99.75346352345'
            );
            await expect(results.get(1).username).toHaveText('username3');
            await expect(results.get(1).organisations).toHaveText('');

            await expect(results.get(2).name).toHaveText('valtion palvelu');
            await expect(results.get(2).name).toHaveAttribute(
                'href',
                '/henkilo-ui/jarjestelmatunnus/1.2.246.562.99.64354357473'
            );
            await expect(results.get(2).username).toHaveText('username4');
            await expect(results.get(2).organisations).toHaveText('');
        });
    });

    test('haku by käyttöoikeusryhmä', async ({ page }) => {
        const { filters, results } = await gotoJarjestelmatunnushaku(page);
        await expect(results.count).toHaveText('Hakutulos (0 järjestelmätunnusta)');

        await mockVirkailijahaku(page, (c) => c.kayttooikeusryhmaId === 4056628, [
            {
                oidHenkilo: '1.2.246.562.99.75346352345',
                kayttajatunnus: 'username3',
                organisaatioNimiList: [],
                nimi: 'opetushalinto, _',
            },
        ]);

        await filters.kayttooikeusryhma.select('kuvaus3');
        await expect(results.count).toHaveText('Hakutulos (1 järjestelmätunnusta)');

        await expect(results.get(1).name).toHaveText('opetushalinto');
        await expect(results.get(1).name).toHaveAttribute(
            'href',
            '/henkilo-ui/jarjestelmatunnus/1.2.246.562.99.75346352345'
        );
        await expect(results.get(1).username).toHaveText('username3');
        await expect(results.get(1).organisations).toHaveText('');
    });

    test('suborganisations is disabled if root organisation is chosen', async ({ page }) => {
        const { filters, results } = await gotoJarjestelmatunnushaku(page);
        await expect(results.count).toHaveText('Hakutulos (0 järjestelmätunnusta)');

        await mockVirkailijahaku(
            page,
            (c) => c.organisaatioOids[0] === '1.2.246.562.10.00000000001' && !c.subOrganisation,
            [
                {
                    oidHenkilo: '1.2.246.562.99.75346352345',
                    kayttajatunnus: 'username3',
                    organisaatioNimiList: [],
                    nimi: 'palvelu, _',
                },
            ]
        );

        await expect(filters.subOrganisationsCheckbox).toBeDisabled();
        await filters.organisaatioSelect.select('root');
        await expect(results.count).toHaveText('Hakutulos (1 järjestelmätunnusta)');

        await expect(filters.subOrganisationsCheckbox).toBeDisabled();
    });
});
