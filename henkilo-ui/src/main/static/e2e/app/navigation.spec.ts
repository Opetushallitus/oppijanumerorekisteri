import { test, expect } from '@playwright/test';
import { Omattiedot } from '../../src/types/domain/kayttooikeus/Omattiedot.types';

const userInfo: Omattiedot = {
    oidHenkilo: '1.2.246.562.24.00000000007',
    organisaatiot: [],
    isAdmin: false,
    isMiniAdmin: false,
    anomusilmoitus: [],
};

const oppijaFixtures: { title: string; userInfo: Omattiedot; expected: string[] }[] = [
    {
        title: 'admin',
        userInfo: { ...userInfo, isAdmin: true },
        expected: ['Oppijahaku ', 'Oppijanumeron luonti ja haku ', 'Oppijoiden tuontiraportti '],
    },
    {
        title: 'no rights',
        userInfo: { ...userInfo },
        expected: [],
    },
    {
        title: 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        userInfo: {
            ...userInfo,
            organisaatiot: [
                {
                    organisaatioOid: '1.2.246.562.10.00000000001',
                    kayttooikeudet: [{ palvelu: 'OPPIJANUMEROREKISTERI', oikeus: 'OPPIJOIDENTUONTI' }],
                },
            ],
        },
        expected: ['Oppijanumeron luonti ja haku ', 'Oppijoiden tuontiraportti '],
    },
    {
        title: 'OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI',
        userInfo: {
            ...userInfo,
            organisaatiot: [
                {
                    organisaatioOid: '1.2.246.562.10.00000000001',
                    kayttooikeudet: [{ palvelu: 'OPPIJANUMEROREKISTERI', oikeus: 'YLEISTUNNISTE_LUONTI' }],
                },
            ],
        },
        expected: ['Oppijanumeron luonti ja haku '],
    },
];

const virkailijaFixtures: { title: string; userInfo: Omattiedot; expected: string[] }[] = [
    {
        title: 'admin',
        userInfo: { ...userInfo, isAdmin: true },
        expected: [
            'Virkailijahaku ',
            'Käyttöoikeusanomukset ',
            'Kutsutut ',
            'Virkailijan kutsuminen Opintopolkuun ',
            'Käyttöoikeusraportti ',
        ],
    },
    {
        title: 'no rights',
        userInfo: { ...userInfo },
        expected: [],
    },
    {
        title: 'KAYTTOOIKEUS_CRUD',
        userInfo: {
            ...userInfo,
            organisaatiot: [
                {
                    organisaatioOid: '1.2.246.562.10.00000000001',
                    kayttooikeudet: [{ palvelu: 'KAYTTOOIKEUS', oikeus: 'CRUD' }],
                },
            ],
        },
        expected: ['Virkailijahaku ', 'Käyttöoikeusanomukset ', 'Kutsutut ', 'Virkailijan kutsuminen Opintopolkuun '],
    },
    {
        title: 'KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT',
        userInfo: {
            ...userInfo,
            organisaatiot: [
                {
                    organisaatioOid: '1.2.246.562.10.00000000001',
                    kayttooikeudet: [{ palvelu: 'KAYTTOOIKEUS', oikeus: 'ACCESS_RIGHTS_REPORT' }],
                },
            ],
        },
        expected: ['Virkailijahaku ', 'Käyttöoikeusraportti '],
    },
];

oppijaFixtures.forEach((fixture) => {
    test(`oppija navigation structure for ${fixture.title}`, async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: fixture.userInfo });
        });

        await page.goto('/henkilo-ui/oppijahaku');
        const tabs = page.locator('.oph-ds-navigation a');
        await expect(tabs).toHaveText(fixture.expected);
    });
});

virkailijaFixtures.forEach((fixture) => {
    test(`virkailija navigation structure for ${fixture.title}`, async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: fixture.userInfo });
        });

        await page.goto('/henkilo-ui/virkailijahaku');
        const tabs = page.locator('.oph-ds-navigation a');
        await expect(tabs).toHaveText(fixture.expected);
    });
});
