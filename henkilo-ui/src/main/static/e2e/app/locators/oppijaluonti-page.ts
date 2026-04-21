import { Page } from '@playwright/test';

export async function gotoOppijaLuonti(page: Page) {
    await page.goto('/henkilo-ui/oppija/luonti');
    const buttons = {
        withSsn: page.getByTestId('oppijan-luonti-hetullinen'),
        withoutSsn: page.getByTestId('oppijan-luonti-hetuton'),
    };
    return {
        ...buttons,
        gotoWithSsn: async () => {
            await buttons.withSsn.click();

            return {
                personalIdentificationNumber: page.getByTestId('personalIdentificationNumber'),
                firstNames: page.getByTestId('firstNames'),
                displayName: page.getByTestId('displayName'),
                lastName: page.getByTestId('lastName'),
                submit: page.getByTestId('submit'),
                clear: page.getByTestId('clear'),
                cancel: page.getByTestId('cancel'),
                existsError: page.locator('.check-result.oph-alert-error'),
                existsSuccess: page.locator('.check-result.oph-alert-success'),
            };
        },
        gotoWithoutSsn: async () => {
            await buttons.withoutSsn.click();

            return {
                firstNames: page.getByTestId('firstNames'),
                displayName: page.getByTestId('displayName'),
                lastName: page.getByTestId('lastName'),
                birthDate: page.locator('#birthDate'),
                gender: page.locator('#gender'),
                nativeLanguage: page.locator('#nativeLanguage'),
                nationality: page.locator('#nationality'),
                passportNumber: page.getByTestId('passportNumber'),
                emailAddress: page.getByTestId('emailAddress'),
                save: page.getByTestId('save'),
                cancel: page.getByTestId('cancel'),
            };
        },
    };
}
