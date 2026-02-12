import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCommonOptions } from './common';
import { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { Omattiedot } from '../types/domain/kayttooikeus/Omattiedot.types';
import { Locale } from '../types/locale.type';
import { KutsuRead } from '../types/domain/kayttooikeus/Kutsu.types';
import { Jarjestelmatunnus, PalvelukayttajaCreate } from '../types/domain/kayttooikeus/palvelukayttaja.types';
import { HenkilohakuResult } from '../types/domain/kayttooikeus/HenkilohakuResult.types';
import { Henkilohaku, HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { KutsututSearchParams } from '../components/kutsutut/KutsututPage';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { Palvelu } from '../types/domain/kayttooikeus/palvelu.types';
import { PalveluKayttooikeus } from '../types/domain/kayttooikeus/palvelukayttooikeus.types';
import {
    Organisaatio,
    OrganisaatioNameLookup,
    OrganisaatioWithChildren,
} from '../types/domain/organisaatio/organisaatio.types';
import { PalveluRooli } from '../types/domain/kayttooikeus/PalveluRooli.types';
import { TextGroupModify } from '../types/domain/kayttooikeus/textgroup.types';
import { PalveluRooliModify } from '../types/domain/kayttooikeus/PalveluRooliModify.types';
import { SallitutKayttajatyypit } from '../components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';
import { KayttajatiedotRead } from '../types/domain/kayttooikeus/KayttajatiedotRead';
import { Henkilo, HenkiloOrg } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import { Values } from '../kayttaja/vahvatunnistus/VahvaTunnistusLisatiedotInputs';
import { VirkailijaCreate } from '../types/domain/kayttooikeus/virkailija.types';

type MfaSetupResponse = {
    secretKey: string;
    qrCodeDataUri: string;
};

type MfaEnableRequest = string;
type MfaDisableRequest = void;
type MfaPostResponse = boolean;

type DeleteHenkiloOrganisationRequest = {
    henkiloOid: string;
    organisationOid: string;
};

type DeleteKayttooikeusryhmaRequest = {
    henkiloOid: string;
    organisationOid: string;
    kayttooikeusryhmaId: number;
};

type PutKayttooikeusryhmaRequest = {
    henkiloOid: string;
    organisationOid: string;
    body: PutKayttooikeus[];
};

type PutKayttooikeus = {
    id: number;
    kayttoOikeudenTila: string;
    alkupvm: string;
    loppupvm: string;
};

type PutKutsuRequest = {
    etunimi: string;
    sukunimi: string;
    sahkoposti: string;
    asiointikieli: string;
    saate?: string;
    organisaatiot: {
        organisaatioOid: string;
        voimassaLoppuPvm: string;
        kayttoOikeusRyhmat: {
            id: number;
        }[];
    }[];
};

export type PostHenkilohakuRequest = {
    subOrganisation?: boolean;
    nameQuery?: string;
    organisaatioOids?: string[];
    kayttooikeusryhmaId?: number;
};

export type AccessRightsReportRow = {
    id: number;
    personName: string;
    personOid: string;
    organisationName: string;
    organisationOid: string;
    accessRightName: string;
    accessRightId: number;
    startDate: string;
    endDate: string;
    modified: string;
    modifiedBy: string;
};

export type GetHaetutKayttooikeusryhmatRequest = {
    q?: string;
    organisaatioOids?: string;
    kayttooikeusRyhmaIds?: number[];
    orderBy: string;
    limit: string;
    showOwnAnomus: string;
    adminView: string;
    anomuksenTilat: string;
    kayttoOikeudenTilas: string;
};

export type PutHaettuKayttooikeusryhmaRequest = {
    henkiloOid: string;
    body: {
        id: number;
        kayttoOikeudenTila: string;
        alkupvm: string;
        loppupvm?: string;
        hylkaysperuste?: string;
    };
};

export type PostKayttooikeusAnomusRequest = {
    organisaatioOrRyhmaOid: string;
    email: string;
    perustelut: string;
    kayttooikeusRyhmaIds: number[];
    anojaOid: string;
};

type PostSalasananVaihtoRequest = {
    loginToken: string;
    newPassword: string;
    currentPassword: string;
};

export type KayttooikeusryhmaRequest = {
    nimi: TextGroupModify;
    kuvaus: TextGroupModify;
    palvelutRoolit: PalveluRooliModify[];
    rooliRajoite: null;
    ryhmaRestriction: boolean;
    organisaatioTyypit: string[];
    slaveIds: number[];
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null;
};

type CasLoginRedirectParams = Record<string, string>;

export type KutsututSortBy = 'AIKALEIMA' | 'NIMI' | 'SAHKOPOSTI';
type KutsututRequest = {
    params: KutsututSearchParams;
    sortBy: KutsututSortBy;
    direction: 'ASC' | 'DESC';
    amount: string;
};

export type HenkiloLinkitykset = {
    henkiloVarmentajas?: string[];
    henkiloVarmennettavas?: string[];
};

type PutUudelleenRekisterointiRequest = {
    kielisyys: string;
    loginToken: string;
    body: Values & { salasana: string };
};

export type RekisteroidyRequest = {
    etunimet: string;
    sukunimi: string;
    kutsumanimi: string;
    asiointiKieli: {
        kieliKoodi: string;
    };
    kayttajanimi: string;
    password: string;
    passwordAgain: string;
};

export const kayttooikeusApi = createApi({
    reducerPath: 'kayttooikeusApi',
    baseQuery: fetchBaseQuery({
        ...getCommonOptions(),
        headers: { ...getCommonOptions().headers, 'Content-Type': 'application/json; charset=utf-8' },
        baseUrl: '/kayttooikeus-service/',
    }),
    tagTypes: [
        'omattiedot',
        'omatkayttooikeusryhmat',
        'omatorganisaatiot',
        'henkiloorganisaatiot',
        'kutsuByToken',
        'accessRightReport',
        'kayttajatiedot',
        'hakatunnisteet',
        'palvelukayttaja',
        'henkilohaku',
        'henkilohakucount',
        'henkilohakuorganisaatiot',
        'henkilolinkitykset',
        'haetutKayttooikeusryhmat',
        'kutsutut',
        'allowedKayttooikeusryhmasForOrganisation',
        'palvelut',
        'palvelukayttoooikeudet',
        'kayttooikeusanomukset',
        'kayttooikeusryhma',
        'kayttooikeusryhmabykayttooikeus',
        'kayttooikeusryhmamyontoviite',
        'kayttooikeusryhmaorganisaatiot',
        'kayttooikeusryhmat',
        'organisaatioryhmat',
        'rootorganisation',
        'organisations',
        'organisationnames',
        'kayttooikeusryhmaroolit',
        'henkilonkayttooikeusryhmat',
        'henkiloByLoginToken',
        'virkailijahaku',
        'jarjestelmatunnushaku',
    ],
    endpoints: (builder) => ({
        getOtuvaPrequel: builder.query<void, void>({
            query: () => 'cas/prequel',
        }),
        getKayttooikeusryhmasForHenkilo: builder.query<MyonnettyKayttooikeusryhma[], string>({
            query: (henkiloOid: string) => `kayttooikeusryhma/henkilo/${henkiloOid}`,
            providesTags: ['henkilonkayttooikeusryhmat'],
        }),
        deleteKayttooikeusryhmaForHenkilo: builder.mutation<void, DeleteKayttooikeusryhmaRequest>({
            query: ({ henkiloOid, organisationOid, kayttooikeusryhmaId }) => ({
                url: `kayttooikeusanomus/${henkiloOid}/${organisationOid}/${kayttooikeusryhmaId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['henkilonkayttooikeusryhmat', 'henkiloorganisaatiot'],
        }),
        putKayttooikeusryhmaForHenkilo: builder.mutation<void, PutKayttooikeusryhmaRequest>({
            query: ({ henkiloOid, organisationOid, body }) => ({
                url: `kayttooikeusanomus/${henkiloOid}/${organisationOid}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['henkilonkayttooikeusryhmat', 'henkiloorganisaatiot'],
        }),
        deleteHenkiloOrganisation: builder.mutation<void, DeleteHenkiloOrganisationRequest>({
            query: ({ henkiloOid, organisationOid }) => ({
                url: `organisaatiohenkilo/${henkiloOid}/${organisationOid}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['henkilonkayttooikeusryhmat', 'henkiloorganisaatiot'],
        }),
        getOmattiedot: builder.query<Omattiedot, void>({
            query: () => 'henkilo/current/omattiedot',
            providesTags: ['omattiedot'],
        }),
        putAnomusilmoitus: builder.mutation<void, { oid: string; anomusilmoitus: number[] }>({
            query: ({ oid, anomusilmoitus }) => ({
                url: `henkilo/${oid}/anomusilmoitus`,
                method: 'PUT',
                body: anomusilmoitus,
            }),
            invalidatesTags: ['omattiedot'],
        }),
        getOmatKayttooikeusryhmas: builder.query<MyonnettyKayttooikeusryhma[], void>({
            query: () => 'kayttooikeusryhma/henkilo/current',
            providesTags: ['omatkayttooikeusryhmat'],
        }),
        getOmatOrganisaatiot: builder.query<OrganisaatioHenkilo[], { oid: string; locale: Locale }>({
            query: ({ oid }) => `henkilo/${oid}/organisaatio?piilotaOikeudettomat=true`,
            providesTags: ['omatorganisaatiot'],
        }),
        getHenkiloOrganisaatiot: builder.query<HenkiloOrg[], string>({
            query: (oid) => `henkilo/${oid}/organisaatiohenkilo`,
            providesTags: ['henkiloorganisaatiot'],
        }),
        getMfaSetup: builder.query<MfaSetupResponse, void>({
            query: () => 'mfasetup/gauth/setup',
            extraOptions: { maxRetries: 0 },
        }),
        postMfaEnable: builder.mutation<MfaPostResponse, MfaEnableRequest>({
            query: (token) => ({
                url: 'mfasetup/gauth/enable',
                method: 'POST',
                body: `"${token}"`,
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['omattiedot'],
        }),
        postMfaDisable: builder.mutation<MfaPostResponse, MfaDisableRequest>({
            query: () => ({
                url: 'mfasetup/gauth/disable',
                method: 'POST',
            }),
            extraOptions: { maxRetries: 0 },
            invalidatesTags: ['omattiedot'],
        }),
        getKutsuByToken: builder.query<KutsuRead, string>({
            query: (token) => `kutsu/token/${token}`,
            providesTags: ['kutsuByToken'],
        }),
        getAccessRightReport: builder.query<AccessRightsReportRow[], string>({
            query: (oid) => `reports/accessrights/${oid}`,
            providesTags: ['accessRightReport'],
        }),
        getKayttajatiedot: builder.query<KayttajatiedotRead, string>({
            query: (oid) => `henkilo/${oid}/kayttajatiedot`,
            providesTags: ['kayttajatiedot'],
        }),
        putKayttajatiedot: builder.mutation<KayttajatiedotRead, { oid: string; username: string }>({
            query: ({ oid, username }) => ({
                url: `henkilo/${oid}/kayttajatiedot`,
                method: 'PUT',
                body: { username },
            }),
            invalidatesTags: ['kayttajatiedot'],
        }),
        putPassword: builder.mutation<void, { oid: string; password: string }>({
            query: ({ oid, password }) => ({
                url: `henkilo/${oid}/password`,
                method: 'POST',
                body: `"${password}"`,
            }),
        }),
        getHakatunnisteet: builder.query<string[], string>({
            query: (oid) => `henkilo/${oid}/hakatunnus`,
            providesTags: ['hakatunnisteet'],
        }),
        putHakatunnisteet: builder.mutation<string[], { oid: string; tunnisteet: string[] }>({
            query: ({ oid, tunnisteet }) => ({
                url: `henkilo/${oid}/hakatunnus`,
                method: 'PUT',
                body: tunnisteet,
            }),
            invalidatesTags: ['hakatunnisteet'],
        }),
        getPalvelukayttaja: builder.query<Jarjestelmatunnus, string>({
            query: (oid) => `palvelukayttaja/${oid}`,
            providesTags: ['palvelukayttaja'],
        }),
        postPalvelukayttaja: builder.mutation<Jarjestelmatunnus, PalvelukayttajaCreate>({
            query: (body) => ({
                url: 'palvelukayttaja',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['palvelukayttaja', 'jarjestelmatunnushaku'],
        }),
        putPalvelukayttajaCasPassword: builder.mutation<string, string>({
            query: (oid) => ({
                url: `palvelukayttaja/${oid}/cas`,
                method: 'PUT',
            }),
            invalidatesTags: ['palvelukayttaja', 'jarjestelmatunnushaku'],
        }),
        putPalvelukayttajaOauth2Secret: builder.mutation<string, string>({
            query: (oid) => ({
                url: `palvelukayttaja/${oid}/oauth2`,
                method: 'PUT',
            }),
            invalidatesTags: ['palvelukayttaja', 'jarjestelmatunnushaku'],
        }),
        postVirkailijahaku: builder.query<HenkilohakuResult[], PostHenkilohakuRequest>({
            query: (body) => ({
                url: 'internal/virkailijahaku',
                method: 'POST',
                body,
            }),
            providesTags: ['virkailijahaku'],
        }),
        postJarjestelmatunnushaku: builder.query<HenkilohakuResult[], PostHenkilohakuRequest>({
            query: (body) => ({
                url: 'internal/jarjestelmatunnushaku',
                method: 'POST',
                body,
            }),
            providesTags: ['jarjestelmatunnushaku'],
        }),
        getHenkiloHaku: builder.infiniteQuery<HenkilohakuResult[], Henkilohaku, number>({
            query: ({ queryArg: { criteria, parameters }, pageParam }) => ({
                url: `henkilo/henkilohaku?${new URLSearchParams({
                    ...parameters,
                    offset: String(pageParam),
                }).toString()}`,
                method: 'POST',
                body: { ...criteria, isCountSearch: false },
            }),
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage, _, lastPageParam) =>
                    lastPage.length === 100 ? lastPageParam + 100 : undefined,
            },
            providesTags: ['henkilohaku'],
        }),
        getHenkiloHakuCount: builder.query<string, HenkilohakuCriteria>({
            query: (criteria) => ({
                url: 'henkilo/henkilohakucount',
                method: 'POST',
                body: { ...criteria, isCountSearch: true },
                responseHandler: 'text',
            }),
            providesTags: ['henkilohakucount'],
        }),
        getHaetutKayttooikeusryhmat: builder.infiniteQuery<
            HaettuKayttooikeusryhma[],
            GetHaetutKayttooikeusryhmatRequest,
            number
        >({
            query: ({ queryArg: { kayttooikeusRyhmaIds, ...rest }, pageParam }) => {
                const params = new URLSearchParams({ ...rest, offset: String(pageParam) });
                kayttooikeusRyhmaIds?.forEach((id) => params.append('kayttooikeusRyhmaIds', String(id)));
                return `kayttooikeusanomus/haettuKayttoOikeusRyhma?${params.toString()}`;
            },
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage, _, lastPageParam) =>
                    lastPage.length === 20 ? lastPageParam + 20 : undefined,
            },
            providesTags: ['haetutKayttooikeusryhmat'],
        }),
        putHaettuKayttooikeusryhma: builder.mutation<void, PutHaettuKayttooikeusryhmaRequest>({
            query: ({ body }) => ({
                url: 'kayttooikeusanomus',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['haetutKayttooikeusryhmat', 'kayttooikeusanomukset', 'henkilonkayttooikeusryhmat'],
        }),
        postSalasananVaihto: builder.mutation<CasLoginRedirectParams, PostSalasananVaihtoRequest>({
            query: (body) => ({
                url: 'cas/salasananvaihto',
                method: 'POST',
                body,
            }),
        }),
        getKutsutut: builder.infiniteQuery<KutsuRead[], KutsututRequest, number>({
            query: ({ queryArg: { params, sortBy, direction, amount }, pageParam }) =>
                `kutsu?${new URLSearchParams({
                    ...params,
                    sortBy,
                    direction,
                    offset: String(pageParam),
                    amount,
                }).toString()}`,
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage, _, lastPageParam) =>
                    lastPage.length === 40 ? lastPageParam + 40 : undefined,
            },
            providesTags: ['kutsutut'],
        }),
        deleteKutsu: builder.mutation<void, number>({
            query: (id) => ({ url: `kutsu/${id}`, method: 'DELETE' }),
            invalidatesTags: ['kutsutut'],
        }),
        putKutsu: builder.mutation<void, PutKutsuRequest>({
            query: (body) => ({ url: 'kutsu', method: 'POST', body }),
            invalidatesTags: ['kutsutut'],
        }),
        putRenewKutsu: builder.mutation<void, number>({
            query: (id) => ({ url: `kutsu/${id}/renew`, method: 'PUT' }),
            invalidatesTags: ['kutsutut'],
        }),
        getHenkiloHakuOrganisaatiot: builder.query<OrganisaatioHenkilo[], string>({
            query: (oid) => `henkilo/${oid}/organisaatio?requiredRoles=HENKILOHAKU`,
            providesTags: ['henkilohakuorganisaatiot'],
        }),
        getHenkiloLinkitykset: builder.query<HenkiloLinkitykset, string>({
            query: (oid) => `henkilo/${oid}/linkitykset`,
            providesTags: ['henkilolinkitykset'],
        }),
        getAllowedKayttooikeusryhmasForOrganisation: builder.query<
            MyonnettyKayttooikeusryhma[],
            { oidHenkilo: string; oidOrganisaatio: string }
        >({
            query: ({ oidHenkilo, oidOrganisaatio }) => ({ url: `kayttooikeusryhma/${oidHenkilo}/${oidOrganisaatio}` }),
            providesTags: ['allowedKayttooikeusryhmasForOrganisation'],
        }),
        getPalvelut: builder.query<Palvelu[], void>({
            query: () => 'palvelu',
            providesTags: ['palvelut'],
        }),
        getPalveluKayttooikeudet: builder.query<PalveluKayttooikeus[], string>({
            query: (palvelu) => `kayttooikeus/${palvelu}`,
            providesTags: ['palvelukayttoooikeudet'],
        }),
        postKayttooikeusAnomus: builder.mutation<void, PostKayttooikeusAnomusRequest>({
            query: (body) => ({ url: `kayttooikeusanomus/${body.anojaOid}`, method: 'POST', body }),
            invalidatesTags: ['kayttooikeusanomukset', 'haetutKayttooikeusryhmat'],
        }),
        putPeruKayttooikeusAnomus: builder.mutation<void, number>({
            query: (body) => ({
                url: `kayttooikeusanomus/peruminen/currentuser`,
                method: 'PUT',
                body: String(body),
            }),
            invalidatesTags: ['kayttooikeusanomukset', 'haetutKayttooikeusryhmat'],
        }),
        getKayttooikeusAnomuksetForHenkilo: builder.query<HaettuKayttooikeusryhma[], string>({
            query: (oid) => `kayttooikeusanomus/${oid}?activeOnly=true`,
            providesTags: ['kayttooikeusanomukset'],
        }),
        getKayttooikeusryhma: builder.query<Kayttooikeusryhma, string>({
            query: (id) => `kayttooikeusryhma/${id}?passiiviset=true`,
            providesTags: ['kayttooikeusryhma'],
        }),
        getKayttooikeusryhmaMyontoviite: builder.query<Kayttooikeusryhma[], string>({
            query: (id) => `kayttooikeusryhma/${id}/sallitut`,
            providesTags: ['kayttooikeusryhmamyontoviite'],
        }),
        getKayttooikeusryhmas: builder.query<
            Kayttooikeusryhma[],
            { passiiviset: boolean; palvelu?: string; kayttooikeus?: string }
        >({
            query: ({ passiiviset, palvelu, kayttooikeus }) =>
                `kayttooikeusryhma?${new URLSearchParams({
                    passiiviset: String(passiiviset),
                    ...(palvelu && kayttooikeus ? { palvelu, kayttooikeus } : {}),
                }).toString()}`,
            providesTags: ['kayttooikeusryhmat'],
        }),
        getKayttooikeusryhmaByKayttooikeus: builder.query<Kayttooikeusryhma[], string>({
            query: (kayttooikeus) => ({
                url: 'kayttooikeusryhma/ryhmasByKayttooikeus',
                method: 'POST',
                body: { KAYTTOOIKEUS: kayttooikeus },
            }),
            providesTags: ['kayttooikeusryhmabykayttooikeus'],
        }),
        getKayttooikeusryhmaOrganisaatiot: builder.query<Kayttooikeusryhma[], string>({
            query: (oid) => `kayttooikeusryhma/organisaatio/${oid}`,
            providesTags: ['kayttooikeusryhmaorganisaatiot'],
        }),
        getKayttooikeusryhmaRoolis: builder.query<PalveluRooli[], string>({
            query: (ryhmaId) => `kayttooikeusryhma/${ryhmaId}/kayttooikeus`,
            providesTags: ['kayttooikeusryhmaroolit'],
        }),
        postKayttooikeusryhma: builder.mutation<void, KayttooikeusryhmaRequest>({
            query: (body) => ({ url: 'kayttooikeusryhma', method: 'POST', body }),
            invalidatesTags: [
                'kayttooikeusryhma',
                'kayttooikeusryhmat',
                'kayttooikeusryhmaroolit',
                'kayttooikeusryhmamyontoviite',
                'kayttooikeusryhmaorganisaatiot',
            ],
        }),
        putKayttooikeusryhma: builder.mutation<void, { id: string; body: KayttooikeusryhmaRequest }>({
            query: ({ id, body }) => ({ url: `kayttooikeusryhma/${id}`, method: 'PUT', body }),
            invalidatesTags: [
                'kayttooikeusryhma',
                'kayttooikeusryhmat',
                'kayttooikeusryhmaroolit',
                'kayttooikeusryhmamyontoviite',
                'kayttooikeusryhmaorganisaatiot',
            ],
        }),
        putAktivoiKayttooikeusryhma: builder.mutation<void, string>({
            query: (id) => ({ url: `kayttooikeusryhma/${id}/aktivoi`, method: 'PUT' }),
            invalidatesTags: [
                'kayttooikeusryhma',
                'kayttooikeusryhmat',
                'kayttooikeusryhmaroolit',
                'kayttooikeusryhmamyontoviite',
                'kayttooikeusryhmaorganisaatiot',
            ],
        }),
        putPassivoiKayttooikeusryhma: builder.mutation<void, string>({
            query: (id) => ({ url: `kayttooikeusryhma/${id}/passivoi`, method: 'PUT' }),
            invalidatesTags: [
                'kayttooikeusryhma',
                'kayttooikeusryhmat',
                'kayttooikeusryhmaroolit',
                'kayttooikeusryhmamyontoviite',
                'kayttooikeusryhmaorganisaatiot',
            ],
        }),
        getOrganisaatioRyhmat: builder.query<OrganisaatioWithChildren[], void>({
            query: () => `organisaatio?${new URLSearchParams({ tyyppi: 'RYHMA' }).toString()}`,
            providesTags: ['organisaatioryhmat'],
        }),
        getRootOrganisation: builder.query<OrganisaatioWithChildren, void>({
            query: () => {
                const params = new URLSearchParams({ tyyppi: 'ORGANISAATIO', tila: 'AKTIIVINEN' });
                params.append('tila', 'SUUNNITELTU');
                return `organisaatio/root?${params.toString()}`;
            },
            providesTags: ['rootorganisation'],
        }),
        getOrganisationNames: builder.query<OrganisaatioNameLookup, void>({
            query: () => 'organisaatio/names',
            providesTags: ['organisationnames'],
        }),
        getOrganisations: builder.query<Organisaatio[], void>({
            query: () => 'organisaatio',
            providesTags: ['organisations'],
        }),
        postUudelleenRekisterointi: builder.mutation<void, PutUudelleenRekisterointiRequest>({
            query: ({ kielisyys, loginToken, body }) => ({
                url: `cas/uudelleenrekisterointi?${new URLSearchParams({ kielisyys, loginToken }).toString()}`,
                method: 'POST',
                body,
            }),
        }),
        postCreateVirkailija: builder.mutation<string, VirkailijaCreate>({
            query: (body) => ({
                url: 'virkailija',
                method: 'POST',
                body,
            }),
        }),
        postRekisteroidy: builder.mutation<void, { token: string; body: RekisteroidyRequest }>({
            query: ({ token, body }) => ({
                url: `kutsu/token/${token}`,
                method: 'POST',
                body,
                responseHandler: 'text',
            }),
        }),
        getHenkiloByLoginToken: builder.query<Henkilo, string>({
            query: (loginToken) => `cas/henkilo/loginToken/${loginToken}`,
            providesTags: ['henkiloByLoginToken'],
        }),
        getEmailVerificationLoginTokenValidation: builder.query<string, string>({
            query: (loginToken) => `cas/emailverification/loginTokenValidation/${loginToken}`,
        }),
        postEmailVerification: builder.mutation<void, { loginToken: string; body: Partial<Henkilo> }>({
            query: ({ loginToken, body }) => ({
                url: `cas/emailverification/${loginToken}`,
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useGetOtuvaPrequelQuery,
    useDeleteHenkiloOrganisationMutation,
    useDeleteKayttooikeusryhmaForHenkiloMutation,
    usePutKayttooikeusryhmaForHenkiloMutation,
    useGetKayttooikeusryhmasForHenkiloQuery,
    useGetOmattiedotQuery,
    usePutAnomusilmoitusMutation,
    useGetOmatOrganisaatiotQuery,
    useGetOmatKayttooikeusryhmasQuery,
    useGetHenkiloOrganisaatiotQuery,
    useGetMfaSetupQuery,
    usePostMfaEnableMutation,
    usePostMfaDisableMutation,
    useGetKutsuByTokenQuery,
    useGetAccessRightReportQuery,
    useGetKayttajatiedotQuery,
    useGetHakatunnisteetQuery,
    usePutHakatunnisteetMutation,
    usePutKayttajatiedotMutation,
    usePutPasswordMutation,
    useGetPalvelukayttajaQuery,
    usePostPalvelukayttajaMutation,
    usePutPalvelukayttajaCasPasswordMutation,
    usePutPalvelukayttajaOauth2SecretMutation,
    useGetHenkiloHakuInfiniteQuery,
    useGetHenkiloHakuCountQuery,
    useGetHaetutKayttooikeusryhmatInfiniteQuery,
    usePutHaettuKayttooikeusryhmaMutation,
    usePostSalasananVaihtoMutation,
    useGetKutsututInfiniteQuery,
    useDeleteKutsuMutation,
    usePutKutsuMutation,
    usePutRenewKutsuMutation,
    useGetHenkiloHakuOrganisaatiotQuery,
    useGetHenkiloLinkityksetQuery,
    useGetAllowedKayttooikeusryhmasForOrganisationQuery,
    useGetPalvelutQuery,
    useGetPalveluKayttooikeudetQuery,
    usePostKayttooikeusAnomusMutation,
    usePutPeruKayttooikeusAnomusMutation,
    useGetKayttooikeusAnomuksetForHenkiloQuery,
    usePutAktivoiKayttooikeusryhmaMutation,
    usePutPassivoiKayttooikeusryhmaMutation,
    useGetKayttooikeusryhmaQuery,
    useGetKayttooikeusryhmaByKayttooikeusQuery,
    useGetKayttooikeusryhmaOrganisaatiotQuery,
    useGetKayttooikeusryhmaMyontoviiteQuery,
    useGetKayttooikeusryhmasQuery,
    usePutKayttooikeusryhmaMutation,
    usePostKayttooikeusryhmaMutation,
    useGetKayttooikeusryhmaRoolisQuery,
    useGetOrganisaatioRyhmatQuery,
    useGetRootOrganisationQuery,
    useGetOrganisationNamesQuery,
    useGetOrganisationsQuery,
    usePostUudelleenRekisterointiMutation,
    usePostCreateVirkailijaMutation,
    usePostRekisteroidyMutation,
    useGetHenkiloByLoginTokenQuery,
    useLazyGetEmailVerificationLoginTokenValidationQuery,
    usePostEmailVerificationMutation,
    usePostVirkailijahakuQuery,
    usePostJarjestelmatunnushakuQuery,
} = kayttooikeusApi;
