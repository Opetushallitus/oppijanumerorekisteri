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
