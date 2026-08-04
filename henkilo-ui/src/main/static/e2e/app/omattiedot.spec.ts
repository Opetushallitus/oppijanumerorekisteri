import { test, expect, Page } from '@playwright/test';

import { toastWithText } from '../locators';
import { gotoOmattiedot } from './locators/omattiedot-page';
import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json' with { type: 'json' };
import henkilo from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000000007/GET.json' with { type: 'json' };

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

        test('edits haka-tunnus', async ({ page }) => {
            const { buttons, haka } = await gotoOmattiedot(page);

            await page.route('/kayttooikeus-service/henkilo/hakatunnus', async (route) => {
                await route.fulfill({
                    json: [],
                });
            });

            await buttons.haka.click();
            await expect(haka.tunnukset).toHaveCount(0);

            await page.route('/kayttooikeus-service/henkilo/hakatunnus', async (route) => {
                await route.fulfill({
                    json: ['uusitunnus'],
                });
            });

            await haka.input.fill('uusitunnus');
            await haka.submit.click();

            await expect(haka.tunnukset).toHaveCount(1);
            await expect(haka.get(1).tunniste).toHaveText('uusitunnus');

            await page.route('/kayttooikeus-service/henkilo/hakatunnus', async (route) => {
                await route.fulfill({
                    json: [],
                });
            });

            await haka.get(1).remove.click();
            await expect(haka.tunnukset).toHaveCount(0);
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

    test.describe('Yhteystiedot', () => {
        type MockYhteystietoRyhma = {
            id: number | null;
            ryhmaKuvaus: string;
            ryhmaAlkuperaTieto: string;
            readOnly: boolean;
            yhteystieto: { yhteystietoTyyppi: string; yhteystietoArvo: string }[];
        };

        const vtjSahkoinenOsoite: MockYhteystietoRyhma = {
            id: 100,
            ryhmaKuvaus: 'yhteystietotyyppi8',
            ryhmaAlkuperaTieto: 'alkupera1',
            readOnly: true,
            yhteystieto: [{ yhteystietoTyyppi: 'YHTEYSTIETO_SAHKOPOSTI', yhteystietoArvo: 'vtj.posti@example.com' }],
        };
        const vtjKotimainenOsoite: MockYhteystietoRyhma = {
            id: 101,
            ryhmaKuvaus: 'yhteystietotyyppi4',
            ryhmaAlkuperaTieto: 'alkupera1',
            readOnly: true,
            yhteystieto: [
                { yhteystietoTyyppi: 'YHTEYSTIETO_KATUOSOITE', yhteystietoArvo: 'Kissakatu 1' },
                { yhteystietoTyyppi: 'YHTEYSTIETO_POSTINUMERO', yhteystietoArvo: '00100' },
            ],
        };
        const tyoosoiteWithoutEmail: MockYhteystietoRyhma = {
            id: 102,
            ryhmaKuvaus: 'yhteystietotyyppi2',
            ryhmaAlkuperaTieto: 'alkupera6',
            readOnly: false,
            yhteystieto: [{ yhteystietoTyyppi: 'YHTEYSTIETO_PUHELINNUMERO', yhteystietoArvo: '0501234567' }],
        };

        const gotoYhteystiedot = async (page: Page) => {
            await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
                await route.fulfill({ json: { ...omattiedot, isAdmin: false } });
            });
            await page.route(`/kayttooikeus-service/henkilo/${oid}/kayttajatiedot`, async (route) => {
                await route.fulfill({ json: { username: 'testi', kayttajaTyyppi: 'VIRKAILIJA' } });
            });
            await page.route(`/oppijanumerorekisteri-service/henkilo/${oid}`, async (route) => {
                await route.fulfill({
                    json: {
                        ...henkilo,
                        yhteystiedotRyhma: [vtjSahkoinenOsoite, vtjKotimainenOsoite, tyoosoiteWithoutEmail],
                    },
                });
            });
            await gotoOmattiedot(page);
            const section = page.getByRole('region', { name: 'Yhteystiedot' });
            return {
                section,
                muokkaa: section.getByRole('button', { name: 'Muokkaa' }),
                tallenna: section.getByRole('button', { name: 'Tallenna' }),
                lisaaUusi: section.getByRole('button', { name: 'Lisää uusi' }),
                poista: section.getByRole('button', { name: 'Poista' }),
                sahkoposti: section.getByLabel('Sähköposti'),
            };
        };

        const routeHenkiloUpdate = async (
            page: Page,
            validate: (yhteystiedotRyhma: MockYhteystietoRyhma[]) => boolean
        ) => {
            await page.route('/oppijanumerorekisteri-service/henkilo', async (route, request) => {
                if (!validate(request.postDataJSON().yhteystiedotRyhma)) {
                    throw new Error('Invalid request!');
                }
                await route.fulfill({ body: oid });
            });
        };

        const sahkopostiArvo = (ryhma?: MockYhteystietoRyhma) =>
            ryhma?.yhteystieto.find((y) => y.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')?.yhteystietoArvo;

        test('adds sähköposti to työosoite that was saved without one', async ({ page }) => {
            const yhteystiedot = await gotoYhteystiedot(page);
            await expect(yhteystiedot.section.getByText('Työosoite')).toBeVisible();
            await expect(yhteystiedot.section.getByText('VTJ Sähköinen osoite')).not.toBeVisible();

            await yhteystiedot.muokkaa.click();
            await yhteystiedot.sahkoposti.fill('virkailija@example.com');

            await routeHenkiloUpdate(
                page,
                (ryhmat) =>
                    sahkopostiArvo(ryhmat.find((r) => r.id === 102)) === 'virkailija@example.com' &&
                    sahkopostiArvo(ryhmat.find((r) => r.id === 100)) === 'vtj.posti@example.com'
            );

            await yhteystiedot.tallenna.click();
            await expect(toastWithText(page, 'Yhteystiedot')).toBeVisible();
        });

        test('adds a new työosoite with sähköposti', async ({ page }) => {
            const yhteystiedot = await gotoYhteystiedot(page);
            await yhteystiedot.muokkaa.click();
            await yhteystiedot.lisaaUusi.click();
            await yhteystiedot.sahkoposti.nth(1).fill('uusi.posti@example.com');

            await routeHenkiloUpdate(
                page,
                (ryhmat) =>
                    sahkopostiArvo(ryhmat.find((r) => !r.id)) === 'uusi.posti@example.com' &&
                    sahkopostiArvo(ryhmat.find((r) => r.id === 100)) === 'vtj.posti@example.com' &&
                    ryhmat.some((r) => r.id === 102)
            );

            await yhteystiedot.tallenna.click();
            await expect(toastWithText(page, 'Yhteystiedot')).toBeVisible();
        });

        test('removes työosoite without sähköposti', async ({ page }) => {
            const yhteystiedot = await gotoYhteystiedot(page);
            await yhteystiedot.muokkaa.click();
            await yhteystiedot.poista.click();
            await expect(yhteystiedot.section.getByText('Työosoite')).not.toBeVisible();

            await routeHenkiloUpdate(
                page,
                (ryhmat) =>
                    !ryhmat.some((r) => r.id === 102) &&
                    ryhmat.some((r) => r.id === 100) &&
                    ryhmat.some((r) => r.id === 101)
            );

            await yhteystiedot.tallenna.click();
            await expect(toastWithText(page, 'Yhteystiedot')).toBeVisible();
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
            await kayttooikeudenAnominen.kayttooikeusModal.lisaa.click();
            await kayttooikeudenAnominen.kayttooikeusModal.close.click();
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
