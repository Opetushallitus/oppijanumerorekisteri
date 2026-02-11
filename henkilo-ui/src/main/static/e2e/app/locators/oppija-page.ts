import { Page } from '@playwright/test';
import { selectLocator } from '../../locators';

export async function gotoOppija(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/oppija2/${oid}`);

    return {
        perustiedot: {
            sukunimi: page.getByTestId('sukunimi'),
            etunimet: page.getByTestId('etunimet'),
            kutsumanimi: page.getByTestId('kutsumanimi'),
            syntymaaika: page.getByTestId('syntymaaika'),
            hetu: page.getByTestId('hetu'),
            eidas: page.getByTestId('eidas'),
            asiointikieli: page.getByTestId('asiointikieli'),
            kansalaisuus: page.getByTestId('kansalaisuus'),
            aidinkieli: page.getByTestId('aidinkieli'),
            sukupuoli: page.getByTestId('sukupuoli'),
            oppijanumero: page.getByTestId('oppijanumero'),
            oid: page.getByTestId('oid'),
        },
        form: {
            kutsumanimi: page.getByLabel('Kutsumanimi'),
            kutsumanimiError: page.locator('input[name="kutsumanimi"] + span'),
            asiointikieliSelect: selectLocator(page, '#asiointikieli-select'),
            etunimet: page.getByLabel('Etunimet'),
            sukunimi: page.getByLabel('Sukunimi'),
            syntymaaika: page.getByLabel('Syntymäaika'),
            hetu: page.getByLabel('Henkilötunnus'),
            kansalaisuusSelect: selectLocator(page, '#kansalaisuus-select'),
            aidinkieliSelect: selectLocator(page, '#aidinkieli-select'),
            sukupuoliSelect: selectLocator(page, '#sukupuoli-select'),
            submit: page.getByRole('button', { name: 'Tallenna', exact: true }),
            cancel: page.getByRole('button', { name: 'Peruuta' }),
        },
        passinumero: {
            passinumerot: page.getByRole('dialog', { name: 'Passinumerot' }).locator('li'),
            get: (i: number) => {
                const row = page.getByLabel('Passinumerot').locator(`ul li:nth-child(${i})`);
                return {
                    passinumero: row.locator('span'),
                    remove: row.locator('button'),
                };
            },
            input: page.getByLabel('Lisää passinumero'),
            submit: page.getByRole('button', { name: 'Tallenna passinumero' }),
        },
        buttons: {
            muokkaa: page.getByRole('button', { name: 'Muokkaa' }).first(),
            passivoi: page.getByRole('button', { name: 'Passivoi henkilö' }),
            passivoiConfirm: page.getByRole('button', { name: 'Vahvista passivointi' }),
            aktivoi: page.getByRole('button', { name: 'Aktivoi henkilö' }),
            aktivoiConfirm: page.getByRole('button', { name: 'Vahvista aktivointi' }),
            yksiloi: page.getByRole('button', { name: 'Yksilöi ilman hetua' }),
            yksiloiConfirm: page.getByRole('button', { name: 'Vahvista yksilöinti' }),
            puraYksilointi: page.getByRole('button', { name: 'Pura yksilöinti' }),
            puraYksilointiConfirm: page.getByRole('button', { name: 'Vahvista yksilöinnin purkaminen' }),
            passinumero: page.getByRole('button', { name: 'Hallitse passinumeroita' }),
            overrideVtjInfo: page.getByRole('button', { name: 'Päivitä VTJ:stä' }),
            overrideVtjInfoConfirm: page.getByRole('button', { name: 'Vahvista VTJ päivitys' }),
        },
    };
}
