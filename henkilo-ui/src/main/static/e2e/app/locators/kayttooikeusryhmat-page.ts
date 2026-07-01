import { Page } from '@playwright/test';

import { selectLocator } from '../../locators';

export async function gotoKayttooikeusryhmat(page: Page) {
    await page.goto('/henkilo-ui/kayttooikeusryhmat');

    const addKayttooikeusryhmaLink = page.locator('#addKayttooikeusryhma');

    return {
        filters: {
            palveluSelect: selectLocator(page, '#palvelu-select'),
            kayttooikeusSelect: selectLocator(page, '#kayttooikeus-select'),
        },
        addKayttooikeusryhmaLink,
        lisaaKayttooikeusPage: async (page: Page) => {
            await addKayttooikeusryhmaLink.click();

            return {
                name: {
                    fi: page.locator('#kayttooikeusryhma-nimi-fi'),
                    sv: page.locator('#kayttooikeusryhma-nimi-sv'),
                    en: page.locator('#kayttooikeusryhma-nimi-en'),
                },
                description: {
                    fi: page.locator('#kayttooikeusryhma-kuvaus-fi'),
                    sv: page.locator('#kayttooikeusryhma-kuvaus-sv'),
                    en: page.locator('#kayttooikeusryhma-kuvaus-en'),
                },
                onlyPalveluKayttajaAllowed: page.locator('#kayttooikeusryhmaKayttajatyyppi'),
                membershipCanBeGrantedToRyhma: page.locator('#ryhmarestriction'),
                organisaatioSelect: {
                    openButton: page.locator('button.organisaatio-select-modal-button'),
                    filterTextInput: page.locator('input.organisaatio-select-filter-input'),
                    list: page.locator('.organisaatio-select-list'),
                    aliorgButton: page.getByText('aliorg (OPPILAITOS)'),
                    orgButton: page.locator('.organisaatio[role="button"]'),
                },
                oppilaitosTyyppiKansalaisopistot: page.getByText('Kansalaisopistot'),
                organisaatioTyyppiOppilaitos: page.getByText('oppilaitos', { exact: true }),
                memberGrantableKayttooikeusRyhmat: selectLocator(page, '#kayttooikeusryhma-myontooikeudet'),
                palvelutJaKayttooikeudet: {
                    palveluSelect: selectLocator(page, '#kayttooikeusryhmat-palvelut'),
                    kayttooikeudetSelect: selectLocator(page, '#kayttooikeusryhmat-palvelu-kayttooikeudet'),
                    addKayttooikeusButton: page.locator('#addPalveluAndKayttooikeusButton'),
                },
                save: page.locator('#kayttooikeusRyhmatSaveGroupButton'),
            };
        },
    };
}
