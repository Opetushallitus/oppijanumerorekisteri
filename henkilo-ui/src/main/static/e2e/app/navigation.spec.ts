import { test, expect } from '@playwright/test';

const userInfo = {
    oidHenkilo: '1.2.246.562.24.00000000007',
    username: 'guggenheim',
    kayttajaTyyppi: 'VIRKAILIJA',
    organisaatiot: [],
    isAdmin: false,
    isMiniAdmin: false,
    anomusilmoitus: [],
};

const fixtures: { title: string; userInfo: any; expected: string[] }[] = [
    {
        title: 'admin',
        userInfo: { ...userInfo, isAdmin: true },
        expected: [
            'Käyttöoikeusanomukset ',
            'Kutsutut ',
            'Virkailijan kutsuminen Opintopolkuun ',
            'Henkilöhaku ',
            'Käyttöoikeusraportti ',
            'Oppijanumeron luonti ja haku ',
            'Oppijoiden tuontiraportti ',
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
        expected: ['Käyttöoikeusanomukset ', 'Kutsutut ', 'Virkailijan kutsuminen Opintopolkuun ', 'Henkilöhaku '],
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
        expected: ['Henkilöhaku ', 'Käyttöoikeusraportti '],
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

fixtures.forEach((fixture) => {
    test(`navigation structure for ${fixture.title}`, async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: fixture.userInfo });
        });

        await page.goto('/henkilo-ui/');
        const tabs = page.locator('#topNavigation ul.tabs li a');
        await expect(tabs).toHaveText(fixture.expected);
    });
});
