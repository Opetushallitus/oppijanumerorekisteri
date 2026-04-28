import { test, expect, Page } from '@playwright/test';

import { gotoVirkailija } from './locators/virkailija-page';
import { toastWithText } from '../locators';

test.describe('virkailija lisää käyttöoikeuksia', () => {
    const oid = '1.2.3.4.66';

    test('renders käyttöoikeus form', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);
        await expect(kayttooikeusForm.valitseOrganisaatio).toBeVisible();
        await expect(kayttooikeusForm.valitseRyhma).toBeVisible();
        await expect(kayttooikeusForm.alkuPvm).toBeVisible();
        await expect(kayttooikeusForm.paattymisPvm).toBeVisible();
        await expect(kayttooikeusForm.valitseKayttooikeusOpenModal).toBeVisible();
        await expect(kayttooikeusForm.valitseKayttooikeusOpenModal).toBeVisible();
        await expect(kayttooikeusForm.valitseModal).not.toBeVisible();
    });

    type KayttooikeusForm = Awaited<ReturnType<typeof gotoVirkailija>>['kayttooikeusForm'];

    const selectOrg = async (page: Page, kayttooikeusForm: KayttooikeusForm, name: string) => {
        await kayttooikeusForm.valitseOrganisaatio.click();
        await page.getByText(name).click();
    };

    test('can open käyttöoikeus modal only once organisation has been selected', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await expect(kayttooikeusForm.valitseKayttooikeusOpenModal).toBeDisabled();
        await expect(kayttooikeusForm.valitseModal).not.toBeVisible();

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');

        await expect(kayttooikeusForm.valitseKayttooikeusOpenModal).not.toBeDisabled();
    });

    test('renders käyttöoikeus modal', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await kayttooikeusForm.valitseKayttooikeusOpenModal.click();

        await expect(kayttooikeusForm.valitseModal).toBeVisible();
        await expect(kayttooikeusForm.valitseModalClose).toBeVisible();
        await expect(kayttooikeusForm.arvoRajapintakayttaja).toBeVisible();
        await expect(kayttooikeusForm.valittuNimi).not.toBeVisible();
        await expect(kayttooikeusForm.valittuKuvaus).not.toBeVisible();

        await kayttooikeusForm.arvoRajapintakayttaja.click();

        await expect(kayttooikeusForm.valittuNimi).toBeVisible();
        await expect(kayttooikeusForm.valittuNimi).toHaveText('ARVO-rajapintakäyttäjä ');
        await expect(kayttooikeusForm.valittuKuvaus).toBeVisible();
        await expect(kayttooikeusForm.valittuKuvaus).toHaveText(
            'Arvo-rajapintakäyttäjä vastaa organisaationsa osalta ArvoAPI:n tunnuksista, teknisestä käyttöönotosta ja käytöstä. Käyttöoikeudet myöntää CSC. Lisätietoja ArvoAPIsta: https://wiki.eduuni.fi/display/CscArvo/Arvon+rajapinnat'
        );

        await kayttooikeusForm.valitseModalClose.click();

        await expect(kayttooikeusForm.valitseModal).not.toBeVisible();
    });

    test('removes applied for käyttöoikeus from available käyttöoikeus list', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await kayttooikeusForm.valitseKayttooikeusOpenModal.click();

        await expect(kayttooikeusForm.arvoRajapintakayttaja).toBeVisible();

        await kayttooikeusForm.arvoRajapintakayttaja.click();
        await kayttooikeusForm.lisaaHaettaviin.click();

        await expect(kayttooikeusForm.arvoRajapintakayttaja).not.toBeVisible();
    });

    test('does not close modal after adding käyttöoikeus', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await expect(kayttooikeusForm.valitseModal).not.toBeVisible();

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await kayttooikeusForm.valitseKayttooikeusOpenModal.click();
        await kayttooikeusForm.arvoRajapintakayttaja.click();

        await expect(kayttooikeusForm.valitseModal).toBeVisible();

        await kayttooikeusForm.valitseModalClose.click();

        await expect(kayttooikeusForm.valitseModal).not.toBeVisible();
    });

    const selectArvoRajapintakayttaja = async (kayttooikeusForm: KayttooikeusForm) => {
        await kayttooikeusForm.valitseKayttooikeusOpenModal.click();
        await kayttooikeusForm.arvoRajapintakayttaja.click();
        await kayttooikeusForm.lisaaHaettaviin.click();
        await kayttooikeusForm.valitseModalClose.click();
    };

    test('applied for käyttöoikeus is visible in a list', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).not.toBeVisible();

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await selectArvoRajapintakayttaja(kayttooikeusForm);

        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).toBeVisible();
        await expect(kayttooikeusForm.arvoRajapintakayttajaPoistaLisatty).toBeVisible();
    });

    test('removes applied for käyttöoikeus from list', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).not.toBeVisible();

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await selectArvoRajapintakayttaja(kayttooikeusForm);

        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).toBeVisible();
        await expect(kayttooikeusForm.arvoRajapintakayttajaPoistaLisatty).toBeVisible();

        await kayttooikeusForm.arvoRajapintakayttajaPoistaLisatty.click();

        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).not.toBeVisible();
    });

    test('shows warning banner when required inputs are missing', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await expect(kayttooikeusForm.validationWarningBanner).toBeVisible();
        await expect(kayttooikeusForm.orgSelectionInvalid).toBeVisible();
        await expect(kayttooikeusForm.selectedCountMinInvalid).toBeVisible();

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');

        await expect(kayttooikeusForm.validationWarningBanner).toBeVisible();
        await expect(kayttooikeusForm.orgSelectionInvalid).not.toBeVisible();
        await expect(kayttooikeusForm.selectedCountMinInvalid).toBeVisible();

        await selectArvoRajapintakayttaja(kayttooikeusForm);

        await expect(kayttooikeusForm.orgSelectionInvalid).not.toBeVisible();
        await expect(kayttooikeusForm.selectedCountMinInvalid).not.toBeVisible();
        await expect(kayttooikeusForm.validationWarningBanner).not.toBeVisible();
    });

    test('adds käyttöoikeus', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);

        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await selectArvoRajapintakayttaja(kayttooikeusForm);
        await page.route(
            '/kayttooikeus-service/kayttooikeusanomus/1.2.3.4.66/1.2.246.562.98.52356235613',
            async (route) => {
                await route.fulfill({
                    status: 200,
                    json: {
                        ryhmaId: 69331052,
                        organisaatioOid: '1.2.246.562.10.87189214833',
                    },
                });
            }
        );
        await kayttooikeusForm.tallenna.click();

        await expect(toastWithText(page, 'Käyttöoikeuden myöntäminen onnistui')).toBeVisible();
        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).not.toBeVisible();
    });

    test('does not reset form if adding fails', async ({ page }) => {
        const { kayttooikeusForm } = await gotoVirkailija(page, oid);
        await selectOrg(page, kayttooikeusForm, 'aliorg (OPPILAITOS)');
        await selectArvoRajapintakayttaja(kayttooikeusForm);
        await page.route(
            '/kayttooikeus-service/kayttooikeusanomus/1.2.3.4.66/1.2.246.562.98.52356235613',
            async (route) => {
                await route.fulfill({
                    status: 500,
                });
            }
        );
        await kayttooikeusForm.tallenna.click();

        await expect(toastWithText(page, 'Käyttöoikeuden myöntäminen epäonnistui')).toBeVisible();
        await expect(kayttooikeusForm.arvoRajapintakayttajaLisatty).toBeVisible();
    });
});
