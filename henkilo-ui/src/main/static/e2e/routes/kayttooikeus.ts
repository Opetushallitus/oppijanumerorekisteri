import { Page } from '@playwright/test';

export const usePostPalvelukayttajaMutation = async (page: Page, oid: string, nimi: string) => {
    await page.route('/kayttooikeus-service/palvelukayttaja', async (route) => {
        if (route.request().method() !== 'POST') {
            await route.fallback();
            return;
        }
        await route.fulfill({
            json: {
                oid,
                kayttajatunnus: null,
                nimi,
            },
        });
    });
};

type Oauth2Credentials = {
    clientId: string;
    created: string;
    updated: string;
    kasittelija: {
        oid: string;
        etunimet: string;
        sukunimi: string;
        kutsumanimi: string;
    };
}[];

export const useGetPalvelukayttajaQuery = async (
    page: Page,
    oid: string,
    nimi: string,
    kayttajatunnus: string,
    oauth2Credentials?: Oauth2Credentials
) => {
    await page.route(`/kayttooikeus-service/palvelukayttaja/${oid}`, async (route) => {
        if (route.request().method() !== 'GET') {
            await route.fallback();
            return;
        }
        await route.fulfill({
            json: {
                oid,
                nimi,
                kayttajatunnus,
                oauth2Credentials: oauth2Credentials ?? [],
            },
        });
    });
};

export const usePutPalvelukayttajaOauth2SecretMutation = async (page: Page, oid: string) => {
    await page.route(`/kayttooikeus-service/palvelukayttaja/${oid}/oauth2`, async (route) => {
        if (route.request().method() !== 'PUT') {
            await route.fallback();
            return;
        }
        await route.fulfill({
            json: '8Sm%ZQ*Xjz6=9C0e7yBeo79M9B*CfdtUSVw1z369',
        });
    });
};

export const usePutPalvelukayttajaCasPasswordMutation = async (page: Page, oid: string) => {
    await page.route(`/kayttooikeus-service/palvelukayttaja/${oid}/cas`, async (route) => {
        if (route.request().method() !== 'PUT') {
            await route.fallback();
            return;
        }
        await route.fulfill({
            json: '3vCHeKkycf3_Y4jVTHe8#X0kF841q+XC569ltC4+',
        });
    });
};
