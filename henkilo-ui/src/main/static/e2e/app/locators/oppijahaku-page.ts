import { Page } from '@playwright/test';

export async function gotoOppijahaku(page: Page) {
    await page.goto('/henkilo-ui/oppijahaku');
    return {
        filters: {
            query: page.getByLabel('Hakutermi'),
            passivoidut: page.getByText('Näytä myös passivoidut'),
        },
        results: {
            count: page.getByTestId('oppijaa-count'),
            get: (i: number) => {
                const row = page.locator(`tbody tr:nth-child(${i})`);
                return {
                    name: row.locator('a'),
                    syntymaaika: row.locator('span'),
                };
            },
        },
        pagination: {
            previous: page.getByLabel('Sivunumerointi').getByRole('button', { name: 'Edellinen' }),
            next: page.getByLabel('Sivunumerointi').getByRole('button', { name: 'Seuraava' }),
            page: (i: number) => page.getByLabel('Sivunumerointi').getByRole('button', { name: `${i}` }),
        },
    };
}
