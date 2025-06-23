import { Page } from '@playwright/test';

export const fetchHenkilo = async (page: Page, oid: string, nimi: string) => {
    await page.route(`/oppijanumerorekisteri-service/henkilo/${oid}`, async (route) => {
        if (route.request().method() !== 'GET') {
            await route.fallback();
            return;
        }
        await route.fulfill({
            json: {
                oidHenkilo: oid,
                hetu: null,
                kaikkiHetut: [],
                passivoitu: false,
                etunimet: '_',
                kutsumanimi: '_',
                sukunimi: nimi,
                aidinkieli: null,
                asiointiKieli: null,
                kansalaisuus: [],
                kasittelijaOid: '1.2.246.562.24.55640294153',
                syntymaaika: null,
                sukupuoli: null,
                kotikunta: null,
                oppijanumero: null,
                turvakielto: false,
                eiSuomalaistaHetua: false,
                yksiloity: false,
                yksiloityVTJ: false,
                yksilointiYritetty: false,
                duplicate: false,
                created: 1750332314272,
                modified: 1750332314272,
                vtjsynced: null,
                yhteystiedotRyhma: [],
                yksilointivirheet: [],
                passinumerot: [],
                kielisyys: [],
            },
        });
    });
};

export const useUpdateHenkiloMutation = async (page: Page, oid: string) => {
    await page.route(`/oppijanumerorekisteri-service/henkilo`, async (route) => {
        if (route.request().method() !== 'PUT') {
            await route.fallback();
            return;
        }
        await route.fulfill({
            json: oid,
        });
    });
};
