import { Page } from '@playwright/test';
import { selectLocator } from '../../locators';

export async function gotoKutsuminen(page: Page) {
    await page.goto('/henkilo-ui/kutsulomake');

    return {
        form: {
            etunimi: page.getByLabel('Etunimi'),
            sukunimi: page.getByLabel('Sukunimi'),
            email: page.getByLabel('Sähköposti'),
            kieliSelect: selectLocator(page, '#kieli-select'),
            viesti: page.getByLabel('Viesti'),
        },
        organisations: {
            add: page.getByRole('button', { name: 'Lisää organisaatio...' }),
            get: (i: number) => {
                const org = page.getByTestId(`addedorg-${i}`);
                return {
                    organisaatio: selectLocator(page, `#organisaatio-${i}`),
                    ryhma: selectLocator(page, `#ryhma-${i}`),
                    kayttooikeus: org.getByRole('button', { name: 'Valitse käyttöoikeus' }),
                    voimassa: org.locator(`voimassa-${i}`),
                    modal: {
                        kayttooikeus: (name: string) => page.getByRole('button', { name }),
                        close: page.locator('.oph-button-close'),
                        lisaa: page.getByRole('button', { name: 'Lisää haettaviin käyttöoikeuksiin' }),
                    },
                };
            },
        },
        submit: page.getByRole('button', { name: 'Tallenna ja lähetä itserekisteröitymissähköposti' }),
        validationBanner: page.locator('.oph-ds-banner-warning'),
        confirmation: {
            content: page.locator('.oph-modal-content'),
            submit: page
                .locator('.oph-modal-content')
                .getByRole('button', { name: 'Tallenna ja lähetä itserekisteröitymissähköposti' }),
        },
    };
}
