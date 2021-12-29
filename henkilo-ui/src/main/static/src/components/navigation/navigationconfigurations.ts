import { NaviTab } from '../../types/navigation.type';

export const mainNavigation: Array<NaviTab> = [
    {
        path: '/raportit/kayttooikeudet',
        label: 'TITLE_RAPORTTI_KAYTTOOIKEUS',
        sallitutRoolit: [
            'OPPIJANUMEROREKISTERI_READ',
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',
            'KAYTTOOIKEUS_READ',
            'KAYTTOOIKEUS_CRUD',
        ],
    },
    {
        path: '/anomukset',
        label: 'NAVI_KAYTTOOIKEUSANOMUKSET',
        sallitutRoolit: [
            'OPPIJANUMEROREKISTERI_READ',
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',
            'KAYTTOOIKEUS_READ',
            'KAYTTOOIKEUS_CRUD',
        ],
    },
    {
        path: '/kutsutut',
        label: 'NAVI_KUTSUTUT',
        sallitutRoolit: ['KAYTTOOIKEUS_READ', 'KAYTTOOIKEUS_CRUD'],
    },
    {
        path: '/kutsulomake',
        label: 'NAVI_VIRKAILIJAN_KUTSUMINEN',
        sallitutRoolit: ['KAYTTOOIKEUS_READ', 'KAYTTOOIKEUS_CRUD'],
    },
    {
        path: '/henkilohaku',
        label: 'NAVI_HENKILOHAKU',
        sallitutRoolit: [
            'OPPIJANUMEROREKISTERI_READ',
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',
            'KAYTTOOIKEUS_READ',
            'KAYTTOOIKEUS_CRUD',
        ],
    },
    {
        path: '/oppija/luonti',
        label: 'NAVI_OPPIJAN_LUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
    {
        path: '/oppijoidentuonti',
        label: 'NAVI_OPPIJOIDEN_TUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
];

export const palvelukayttajaNavigation: Array<NaviTab> = [
    { path: '/palvelukayttaja', label: 'NAVI_PALVELUKAYTTAJA_HAKU' },
    { path: '/palvelukayttaja/luonti', label: 'NAVI_PALVELUKAYTTAJA_LUONTI' },
];

export const oppijaNavi = (oid: string): Array<NaviTab> => [
    { path: '/oppija/' + oid, label: 'NAVI_HENKILON_TIEDOT' },
    {
        path: `/oppija/${oid}/duplikaatit`,
        label: 'NAVI_HAE_DUPLIKAATIT',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
    {
        path: `/oppija/${oid}/vtjvertailu`,
        label: 'NAVI_VTJ_VERTAILU',
        disabled: true,
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
];

export const virkailijaNavi = (oid: string): Array<NaviTab> => [
    { path: `/virkailija/${oid}`, label: 'NAVI_HENKILON_TIEDOT' },
    {
        path: `/virkailija/${oid}/duplikaatit`,
        label: 'NAVI_HAE_DUPLIKAATIT',
        disabled: true,
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA'],
    },
    {
        path: `/virkailija/${oid}/vtjvertailu`,
        label: 'NAVI_VTJ_VERTAILU',
        disabled: true,
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA'],
    },
];

export const emptyNavi: Array<NaviTab> = [];
