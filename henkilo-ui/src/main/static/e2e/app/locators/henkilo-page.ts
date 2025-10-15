import { Page, Route } from '@playwright/test';

export const EIDAS_LEON_ELIAS_GERMANY_OID = '1.2.246.562.24.92212175391';

export async function gotoHenkiloView(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/virkailija/${oid}`);
    const lisaaKayttooikeuksiaSection = page.getByRole('region', { name: 'Lisää käyttöoikeuksia' });
    return {
        ...henkilonakymaLocators(page),
        lisaaKayttooikeuksia: {
            section: lisaaKayttooikeuksiaSection,
            input: lisaaKayttooikeuksiaSection.locator('input#organisaatio-select'),
            suggestions: lisaaKayttooikeuksiaSection.locator('.oph-ds-select-org-option'),
        },
    };
}

export async function gotoOppijaView(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/oppija/${oid}?permissionCheckService=ATARU`);
    return henkilonakymaLocators(page);
}

function henkilonakymaLocators(page: Page) {
    const perustiedot = page.getByRole('region', { name: 'Perustiedot' });
    const henkilotunnisteet = page.getByRole('region', { name: 'Henkilötunnisteet' });

    return {
        perustiedot: {
            otsikko: perustiedot.getByRole('heading'),
            etunimet: perustiedot.locator('div#HENKILO_ETUNIMET span.field'),
            sukunimi: perustiedot.locator('div#HENKILO_SUKUNIMI span.field'),
        },
        henkilotunnisteet: {
            section: henkilotunnisteet,
            openLisääHenkilötunnisteDialog: async () => {
                await henkilotunnisteet.getByRole('button', { name: 'Lisää henkilötunniste' }).click();
                const dialog = page.getByRole('dialog', { name: 'Lisää henkilötunniste' });
                return {
                    dialog,
                    identifier: dialog.locator('#newIdentifier'),
                    idpEntityId: dialog.locator('#newIdpEntityId'),
                    lisaaHenkilotunnisteButton: dialog.getByRole('button', { name: 'Lisää henkilötunniste' }),
                };
            },
        },
    };
}

export async function mockRoute(page: Page, endpoint: string, options: Parameters<Route['fulfill']>[0]) {
    await page.route(endpoint, async (route) => {
        await route.fulfill(options);
    });
}
