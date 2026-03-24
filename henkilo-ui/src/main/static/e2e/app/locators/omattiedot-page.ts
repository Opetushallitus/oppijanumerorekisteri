import { Page } from '@playwright/test';
import { selectLocator } from '../../locators';

export async function gotoOmattiedot(page: Page) {
    await page.goto('/henkilo-ui/omattiedot2');
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
            varmennettava: page.getByTestId('varmennettava'),
            varmentaja: page.getByTestId('varmentaja'),
            username: page.getByTestId('username'),
        },
        form: {
            kutsumanimi: page.getByLabel('Kutsumanimi'),
            kutsumanimiError: page.getByTestId('input-error-kutsumanimi'),
            asiointikieliSelect: selectLocator(page, '#asiointikieli-select'),
            submit: page.getByRole('button', { name: 'Tallenna', exact: true }),
            cancel: page.getByRole('button', { name: 'Peruuta' }),
        },
        buttons: {
            muokkaa: page.getByRole('button', { name: 'Muokkaa' }).first(),
            password: page.getByRole('button', { name: 'Aseta salasana' }),
            anomusilmoitukset: page.getByRole('button', { name: 'Anomusilmoitukset' }),
        },
        password: {
            password: page.getByLabel('Uusi salasana'),
            passwordError: page.getByTestId('input-error-password'),
            passwordConfirmed: page.getByLabel('Vahvista salasana'),
            passwordConfirmedError: page.getByTestId('input-error-passwordConfirmed'),
            submit: page
                .getByRole('dialog', { name: 'Aseta salasana' })
                .getByRole('button', { name: 'Aseta salasana' }),
        },
        anomusilmoitukset: {
            anomusilmoituksetSelect: selectLocator(page, '#anomusilmoitusSelect'),
            rows: page.locator('.anomusilmoitus-rows'),
            tallenna: page.getByRole('button', { name: 'Tallenna' }),
            peruuta: page.getByRole('button', { name: 'Peruuta' }),
        },
    };
}
