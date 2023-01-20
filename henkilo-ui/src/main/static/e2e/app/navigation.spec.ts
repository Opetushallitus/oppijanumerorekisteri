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
            'NAVI_KAYTTOOIKEUSANOMUKSET ',
            'NAVI_KUTSUTUT ',
            'NAVI_VIRKAILIJAN_KUTSUMINEN ',
            'NAVI_HENKILOHAKU ',
            'KAYTTOOIKEUSRAPORTTI_TITLE ',
            'NAVI_OPPIJAN_LUONTI ',
            'NAVI_OPPIJOIDEN_TUONTI ',
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
        expected: [
            'NAVI_KAYTTOOIKEUSANOMUKSET ',
            'NAVI_KUTSUTUT ',
            'NAVI_VIRKAILIJAN_KUTSUMINEN ',
            'NAVI_HENKILOHAKU ',
        ],
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
        expected: ['NAVI_HENKILOHAKU ', 'KAYTTOOIKEUSRAPORTTI_TITLE '],
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
        expected: ['NAVI_OPPIJAN_LUONTI ', 'NAVI_OPPIJOIDEN_TUONTI '],
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
        expected: ['NAVI_OPPIJAN_LUONTI'],
    },
];

fixtures.forEach((fixture) => {
    test(`navigation structure for ${fixture.title}`, async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: fixture.userInfo });
        });

        await page.goto('/');
        const tabs = await page.locator('#topNavigation ul.tabs li a');
        await expect(tabs).toHaveText(fixture.expected);
    });
});
