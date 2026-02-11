import { test, expect } from '@playwright/test';

import { gotoOppija } from './locators/oppija-page';

import vahvastiYksiloity from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.246.562.98.24707445854/GET.json';
import yksiloityHetuton from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000007357/GET.json';
import { Kansalaisuus } from '../../src/types/domain/oppijanumerorekisteri/kansalaisuus.types';

test.describe('oppijan perustiedot', () => {
    const vahvastiYksiloityOid = '1.2.246.562.98.24707445854';
    const yksiloityHetutonOid = '1.2.246.562.24.00000007357';

    test('renders information', async ({ page }) => {
        const { perustiedot } = await gotoOppija(page, vahvastiYksiloityOid);
        await expect(perustiedot.sukunimi).toHaveText('Denimman');
        await expect(perustiedot.etunimet).toHaveText('Greta');
        await expect(perustiedot.kutsumanimi).toHaveText('Greta');
        await expect(perustiedot.syntymaaika).toHaveText('8.10.1986');
        await expect(perustiedot.sukupuoli).toHaveText('nainen');
        await expect(perustiedot.hetu).toHaveText('081086-998L');
        await expect(perustiedot.aidinkieli).toHaveText('viittomakieli');
        await expect(perustiedot.asiointikieli).toHaveText('suomi');
        await expect(perustiedot.kansalaisuus).toHaveText('Suomi');
        await expect(perustiedot.oid).toHaveText(vahvastiYksiloityOid);
    });

    test('edits vahvasti yksilöity oppija', async ({ page }) => {
        const { buttons, form, perustiedot } = await gotoOppija(page, vahvastiYksiloityOid);
        await expect(perustiedot.kutsumanimi).toHaveText('Greta');

        await buttons.muokkaa.click();
        await form.kutsumanimi.fill('kutsumanimi');
        await expect(form.sukunimi).not.toBeAttached();
        await expect(form.etunimet).not.toBeAttached();
        await expect(form.hetu).not.toBeAttached();
        await expect(form.sukupuoliSelect.locator).not.toBeAttached();
        await expect(form.aidinkieliSelect.locator).not.toBeAttached();
        await expect(form.kansalaisuusSelect.locator).not.toBeAttached();
        await expect(form.syntymaaika).not.toBeAttached();
        await form.cancel.click();
        await expect(perustiedot.kutsumanimi).toHaveText('Greta');

        await buttons.muokkaa.click();
        await expect(form.kutsumanimiError).not.toBeAttached();
        await form.kutsumanimi.fill('asd');
        await expect(form.submit).toBeDisabled();
        await expect(form.kutsumanimiError).toHaveText('Kutsumanimen tulee olla joku etunimistä');

        await form.kutsumanimi.fill('Greta');
        await form.asiointikieliSelect.select('ruotsi');

        await page.route('/oppijanumerorekisteri-service/henkilo', async (route, request) => {
            if (request.postDataJSON().asiointiKieli.kieliKoodi !== 'sv') {
                throw new Error('Invalid kieliKoodi!');
            }
            await route.fulfill({
                body: vahvastiYksiloityOid,
            });
        });
        await page.route(`/oppijanumerorekisteri-service/henkilo/${vahvastiYksiloityOid}`, async (route) => {
            await route.fulfill({
                json: {
                    ...vahvastiYksiloity,
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

    test('edits vahvasti yksilöimätön oppija', async ({ page }) => {
        const { buttons, form, perustiedot } = await gotoOppija(page, yksiloityHetutonOid);
        await expect(perustiedot.sukunimi).toHaveText('Henkilö');

        await buttons.muokkaa.click();
        await form.etunimet.fill('etu nimi');
        await form.sukunimi.fill('suku-nimi');
        await form.kutsumanimi.fill('nimi');
        await form.hetu.fill('010123-123H');
        await form.syntymaaika.fill('1.1.2023');
        await form.sukupuoliSelect.select('mies');
        await form.aidinkieliSelect.select('ruotsi');
        await form.kansalaisuusSelect.select('Entinen Sudan');
        await form.kansalaisuusSelect.select('Norja');
        await form.asiointikieliSelect.select('englanti');

        await page.route('/oppijanumerorekisteri-service/henkilo', async (route, request) => {
            const j = request.postDataJSON();
            if (
                j.etunimet !== 'etu nimi' ||
                j.sukunimi !== 'suku-nimi' ||
                j.kutsumanimi !== 'nimi' ||
                j.hetu !== '010123-123H' ||
                j.syntymaaika !== '2023-01-01' ||
                j.sukupuoli !== '1' ||
                !j.kansalaisuus
                    .map((k: Kansalaisuus) => k.kansalaisuusKoodi)
                    .every((k: string) => k === '248' || k === '736' || k === '578') ||
                j.aidinkieli.kieliKoodi !== 'sv' ||
                j.asiointiKieli.kieliKoodi !== 'en'
            ) {
                throw new Error('Invalid request!');
            }
            await route.fulfill({
                body: yksiloityHetutonOid,
            });
        });
        await page.route(`/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}`, async (route) => {
            await route.fulfill({
                json: {
                    ...yksiloityHetuton,
                    etunimet: 'etu nimi',
                    sukunimi: 'suku-nimi',
                    kutsumanimi: 'nimi',
                    hetu: '010123-123H',
                    syntymaaika: '2023-01-01',
                    sukupuoli: '1',
                    kansalaisuus: [{ kansalaisuusKoodi: '736' }, { kansalaisuusKoodi: '578' }],
                    aidinkieli: {
                        kieliKoodi: 'sv',
                        kieliTyyppi: 'ruotsi',
                    },
                    asiointiKieli: {
                        kieliKoodi: 'en',
                        kieliTyyppi: 'englanti',
                    },
                },
            });
        });

        await form.submit.click();
        await expect(perustiedot.etunimet).toHaveText('etu nimi');
        await expect(perustiedot.sukunimi).toHaveText('suku-nimi');
        await expect(perustiedot.kutsumanimi).toHaveText('nimi');
        await expect(perustiedot.hetu).toHaveText('010123-123H');
        await expect(perustiedot.syntymaaika).toHaveText('1.1.2023');
        await expect(perustiedot.sukupuoli).toHaveText('mies');
        await expect(perustiedot.kansalaisuus).toHaveText('Entinen Sudan, Norja');
        await expect(perustiedot.asiointikieli).toHaveText('englanti');
        await expect(perustiedot.aidinkieli).toHaveText('ruotsi');
    });

    test('edits passinumerot', async ({ page }) => {
        const { buttons, passinumero } = await gotoOppija(page, yksiloityHetutonOid);

        await page.route(
            `/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}/passinumerot`,
            async (route) => {
                await route.fulfill({
                    json: [],
                });
            }
        );

        await buttons.passinumero.click();
        await expect(passinumero.passinumerot).toHaveCount(0);

        await page.route(
            `/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}/passinumerot`,
            async (route, request) => {
                if (request.method() === 'POST' && request.postDataJSON()[0] !== '123456') {
                    throw new Error('Invalid request!');
                }
                await route.fulfill({
                    json: ['123456'],
                });
            }
        );

        await passinumero.input.fill('123456');
        await passinumero.submit.click();

        await expect(passinumero.passinumerot).toHaveCount(1);
        await expect(passinumero.get(1).passinumero).toHaveText('123456');

        await page.route(
            `/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}/passinumerot`,
            async (route) => {
                await route.fulfill({
                    json: [],
                });
            }
        );

        await passinumero.get(1).remove.click();
        await expect(passinumero.passinumerot).toHaveCount(0);
    });

    test('passivoi & aktivoi oppija', async ({ page }) => {
        const { buttons } = await gotoOppija(page, yksiloityHetutonOid);

        await expect(page.locator('h2').first()).toContainText('(yksilöity hetuton)');

        await buttons.passivoi.click();
        await buttons.passivoiConfirm.click();

        await page.route(`/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}`, async (route, request) => {
            if (request.method() === 'DELETE' && !request.postDataJSON().passivoitu) {
                throw new Error('Invalid request!');
            }
            if (request.method() === 'DELETE') {
                await route.fulfill({
                    status: 200,
                });
            } else {
                await route.fulfill({
                    json: {
                        ...yksiloityHetuton,
                        passivoitu: true,
                    },
                });
            }
        });

        await expect(page.locator('h2').first()).toContainText('(yksilöity hetuton, Henkilö on passivoitu)');

        await page.route('/oppijanumerorekisteri-service/henkilo', async (route, request) => {
            if (request.method() !== 'PUT' || request.postDataJSON().passivoitu !== false) {
                throw new Error('Invalid request!');
            }
            await route.fulfill({
                body: yksiloityHetutonOid,
            });
        });
        await page.route(`/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}`, async (route) => {
            await route.fulfill({
                json: {
                    ...yksiloityHetuton,
                    passivoitu: false,
                },
            });
        });

        await buttons.aktivoi.click();
        await buttons.aktivoiConfirm.click();

        await expect(page.locator('h2').first()).toContainText('(yksilöity hetuton)');
    });

    test('pura yksilointi & yksiloi oppija', async ({ page }) => {
        const { buttons } = await gotoOppija(page, yksiloityHetutonOid);

        await expect(page.locator('h2').first()).toContainText('(yksilöity hetuton)');

        await buttons.puraYksilointi.click();
        await buttons.puraYksilointiConfirm.click();

        await page.route(
            `/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}/purayksilointi`,
            async (route) => {
                await route.fulfill({
                    status: 200,
                });
            }
        );
        await page.route(`/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}`, async (route) => {
            await route.fulfill({
                json: {
                    ...yksiloityHetuton,
                    yksiloity: false,
                },
            });
        });

        await expect(page.locator('h2').first()).toContainText('(yksilöimätön)');

        await page.route(
            `/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}/yksiloihetuton`,
            async (route) => {
                await route.fulfill({
                    status: 200,
                });
            }
        );
        await page.route(`/oppijanumerorekisteri-service/henkilo/${yksiloityHetutonOid}`, async (route) => {
            await route.fulfill({
                json: {
                    ...yksiloityHetuton,
                    yksiloity: true,
                },
            });
        });

        await buttons.yksiloi.click();
        await buttons.yksiloiConfirm.click();

        await expect(page.locator('h2').first()).toContainText('(yksilöity hetuton)');
    });

    test('override with vtj information', async ({ page }) => {
        const { perustiedot, buttons } = await gotoOppija(page, vahvastiYksiloityOid);

        await expect(perustiedot.sukunimi).toHaveText('Denimman');

        await page.route(
            `/oppijanumerorekisteri-service/henkilo/${vahvastiYksiloityOid}/yksilointitiedot`,
            async (route) => {
                await route.fulfill({
                    status: 200,
                });
            }
        );
        await page.route(`/oppijanumerorekisteri-service/henkilo/${vahvastiYksiloityOid}`, async (route) => {
            await route.fulfill({
                json: {
                    ...vahvastiYksiloity,
                    sukunimi: 'Garbonara',
                },
            });
        });

        await buttons.overrideVtjInfo.click();
        await buttons.overrideVtjInfoConfirm.click();

        await expect(perustiedot.sukunimi).toHaveText('Garbonara');
    });
});
