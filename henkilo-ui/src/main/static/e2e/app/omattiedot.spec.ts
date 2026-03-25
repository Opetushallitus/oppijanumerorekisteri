import { test, expect } from '@playwright/test';

import { toastWithText } from '../locators';
import { gotoOmattiedot } from './locators/omattiedot-page';
import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import henkilo from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000000007/GET.json';

test.describe('omattiedot', () => {
    const oid = '1.2.246.562.24.00000000007';

    test.describe('Perustiedot', () => {
        test('renders information', async ({ page }) => {
            await page.route(`/kayttooikeus-service/henkilo/${oid}/linkitykset`, async (route) => {
                await route.fulfill({
                    json: { henkiloVarmennettavas: ['1.2.246.562.24.17520645815'], henkiloVarmentajas: [] },
                });
            });

            const { perustiedot } = await gotoOmattiedot(page);
            await expect(perustiedot.sukunimi).toHaveText('Henkilö');
            await expect(perustiedot.etunimet).toHaveText('Testi Pesti');
            await expect(perustiedot.kutsumanimi).toHaveText('Testi');
            await expect(perustiedot.oppijanumero).toHaveText(oid);
            await expect(perustiedot.syntymaaika).toHaveText('12.12.1912');
            await expect(perustiedot.kansalaisuus).toHaveText('Ahvenanmaa');
            await expect(perustiedot.aidinkieli).toHaveText('suomi');
            await expect(perustiedot.asiointikieli).toHaveText('suomi');
            await expect(perustiedot.username).toHaveText('testi');
            await expect(perustiedot.varmennettava.locator('a')).toHaveAttribute(
                'href',
                '/henkilo-ui/virkailija/1.2.246.562.24.17520645815'
            );
        });

        test('edits vahvasti yksilöity oppija', async ({ page }) => {
            const { buttons, form, perustiedot } = await gotoOmattiedot(page);
            await expect(perustiedot.kutsumanimi).toHaveText('Testi');

            await buttons.muokkaa.click();
            await form.kutsumanimi.fill('kutsumanimi');
            await form.cancel.click();
            await expect(perustiedot.kutsumanimi).toHaveText('Testi');

            await buttons.muokkaa.click();
            await expect(form.kutsumanimiError).not.toBeAttached();
            await form.kutsumanimi.fill('asd');
            await expect(form.submit).toBeDisabled();
            await expect(form.kutsumanimiError).toHaveText('Kutsumanimen tulee olla joku etunimistä');

            await form.kutsumanimi.fill('Pesti');
            await form.asiointikieliSelect.select('ruotsi');

            await page.route('/oppijanumerorekisteri-service/henkilo', async (route, request) => {
                if (request.postDataJSON().asiointiKieli.kieliKoodi !== 'sv') {
                    throw new Error('Invalid kieliKoodi!');
                }
                await route.fulfill({
                    body: oid,
                });
            });
            await page.route(`/oppijanumerorekisteri-service/henkilo/${oid}`, async (route) => {
                await route.fulfill({
                    json: {
                        ...henkilo,
                        asiointiKieli: {
                            kieliKoodi: 'sv',
                            kieliTyyppi: 'ruotsi',
                        },
                    },
                });
            });

            await form.submit.click();
            await expect(perustiedot.asiointikieli).toHaveText('ruotsi');
        });

        test('changes password', async ({ page }) => {
            const { buttons, password } = await gotoOmattiedot(page);

            await buttons.password.click();
            await expect(password.submit).toBeDisabled();
            await expect(password.passwordError).toHaveText('Salasana ei täytä muotovaatimuksia.');
            await expect(password.passwordConfirmedError).not.toBeAttached();

            await password.password.fill('password1!');
            await expect(password.submit).toBeDisabled();
            await expect(password.passwordError).toHaveText('Salasana ei täytä muotovaatimuksia.');
            await expect(password.passwordConfirmedError).toHaveText(
                'Salasanan vahvistus ei täsmää uuden salasanan kanssa.'
            );

            await password.password.fill('asdfgASDFG12345!#$%*');
            await expect(password.submit).toBeDisabled();
            await expect(password.passwordError).not.toBeAttached();
            await expect(password.passwordConfirmedError).toHaveText(
                'Salasanan vahvistus ei täsmää uuden salasanan kanssa.'
            );

            await password.passwordConfirmed.fill('asdfgASDFG12345!#$%*');
            await expect(password.submit).toBeEnabled();
            await expect(password.passwordError).not.toBeAttached();
            await expect(password.passwordConfirmedError).not.toBeAttached();

            await page.route(`/kayttooikeus-service/henkilo/${oid}/password`, async (route) => {
                await route.fulfill({
                    status: 200,
                });
            });

            await password.submit.click();
            await expect(toastWithText(page, 'Salasanan tallennus onnistui.')).toBeVisible();
        });

        test('anomusilmoitukset', async ({ page }) => {
            const { buttons, anomusilmoitukset } = await gotoOmattiedot(page);

            await buttons.anomusilmoitukset.click();
            await expect(anomusilmoitukset.rows).toHaveText('teksti1');

            await anomusilmoitukset.anomusilmoituksetSelect.select('nimi2');
            await expect(anomusilmoitukset.rows).toHaveText('teksti1nimi2');
            await anomusilmoitukset.rows.locator('button').first().click();
            await expect(anomusilmoitukset.rows).toHaveText('nimi2');

            await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
                await route.fulfill({
                    json: { ...omattiedot, anomusilmoitus: [321] },
                });
            });

            await page.route(`/kayttooikeus-service/henkilo/${oid}/anomusilmoitus`, async (route, request) => {
                const d = request.postDataJSON();
                if (d.length !== 1 || d[0] !== 321) {
                    throw new Error('Invalid request!');
                }
                await route.fulfill({
                    status: 200,
                });
            });

            await anomusilmoitukset.tallenna.click();
            await buttons.anomusilmoitukset.click();
            await expect(anomusilmoitukset.rows).toHaveText('nimi2');
        });
    });

    test.describe('Uuden käyttöoikeuden anominen', () => {
        test('happy path', async ({ page }) => {
            const { kayttooikeudenAnominen } = await gotoOmattiedot(page);
            await expect(kayttooikeudenAnominen.haeButton).toBeDisabled();
            await expect(kayttooikeudenAnominen.kayttooikeusButton).toBeDisabled();

            await kayttooikeudenAnominen.organisaatioSelect.select('Opetusorganisaatio');
            await kayttooikeudenAnominen.emailSelect.select('virheellin@skogpost.fi');
            await expect(kayttooikeudenAnominen.haeButton).toBeDisabled();

            await kayttooikeudenAnominen.kayttooikeusButton.click();
            await kayttooikeudenAnominen.kayttooikeusModal.kayttooikeus('kayttooikeus2').click();
            await kayttooikeudenAnominen.kayttooikeusModal.lisaaButton.click();
            await kayttooikeudenAnominen.kayttooikeusModal.closeButton.click();
            await expect(kayttooikeudenAnominen.haeButton).toBeDisabled();

            await page.route(`/kayttooikeus-service/kayttooikeusanomus/${oid}`, async (route, request) => {
                const d = request.postDataJSON();
                if (
                    d.email !== 'virheellin@skogpost.fi' ||
                    d.perustelut !== 'perustelen hyvin' ||
                    d.kayttooikeusRyhmaIds[0] !== 69101599 ||
                    d.organisaatioOrRyhmaOid !== '1.2.246.562.10.00000000123'
                ) {
                    throw new Error('Invalid request!');
                }
                await route.fulfill({
                    status: 200,
                });
            });

            await kayttooikeudenAnominen.perustelut.fill('perustelen hyvin');
            await kayttooikeudenAnominen.haeButton.click();

            await expect(toastWithText(page, 'Käyttöoikeusanomus luotu onnistuneesti')).toBeVisible();
        });
    });
});
