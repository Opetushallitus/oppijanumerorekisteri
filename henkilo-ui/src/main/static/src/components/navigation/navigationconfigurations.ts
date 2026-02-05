import { NaviTab } from '../../types/navigation.type';

export const mainNavigation: Array<NaviTab> = [
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
            'KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT',
        ],
    },
    {
        path: '/raportit/kayttooikeudet',
        label: 'KAYTTOOIKEUSRAPORTTI_TITLE',
        sallitutRoolit: ['KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT'],
    },
    {
        path: '/oppija/luonti',
        label: 'NAVI_OPPIJAN_LUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI', 'OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI'],
    },
    {
        path: '/oppijoidentuonti',
        label: 'NAVI_OPPIJOIDEN_TUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
];

export const oppijaNavigation = [
    {
        path: '/oppijahaku',
        label: 'NAVI_OPPIJAHAKU',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_REKISTERINPITAJA'],
    },
    {
        path: '/oppija/luonti',
        label: 'NAVI_OPPIJAN_LUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI', 'OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI'],
    },
    {
        path: '/oppijoidentuonti',
        label: 'NAVI_OPPIJOIDEN_TUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
];

export const virkailijaNavigation = [
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
        path: '/virkailijahaku',
        label: 'VIRKAILIJAHAKU',
        sallitutRoolit: [
            'OPPIJANUMEROREKISTERI_READ',
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA_READ',
            'KAYTTOOIKEUS_READ',
            'KAYTTOOIKEUS_CRUD',
            'KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT',
        ],
    },
    {
        path: '/raportit/kayttooikeudet',
        label: 'KAYTTOOIKEUSRAPORTTI_TITLE',
        sallitutRoolit: ['KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT'],
    },
];

export const jarjestelmatunnusNavigation = (oid?: string) =>
    oid
        ? [
              { path: '/jarjestelmatunnus', label: 'JARJESTELMATUNNUSTEN_HAKU' },
              { path: '/jarjestelmatunnus/luonti', label: 'JARJESTELMATUNNUSTEN_LUONTI' },
              { path: `/jarjestelmatunnus/${oid}`, label: 'JARJESTELMATUNNUKSEN_HALLINTA' },
          ]
        : [
              { path: '/jarjestelmatunnus', label: 'JARJESTELMATUNNUSTEN_HAKU' },
              { path: '/jarjestelmatunnus/luonti', label: 'JARJESTELMATUNNUSTEN_LUONTI' },
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

export const virkailija2Navi = (oid: string): Array<NaviTab> => [
    { path: `/virkailija/${oid}`, label: 'NAVI_VIRKAILIJAN_TIEDOT' },
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
