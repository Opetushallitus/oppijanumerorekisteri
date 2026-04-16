export const oppijaNavigation = [
    {
        path: '/oppijahaku',
        label: 'NAVI_OPPIJAHAKU',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_REKISTERINPITAJA'],
    },
    {
        path: '/oppija/luonti',
        label: 'NAVI_OPPIJAN_LUONTI',
        sallitutRoolit: [
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
            'OPPIJANUMEROREKISTERI_YLEISTUNNISTE_LUONTI',
        ],
    },
    {
        path: '/oppijoidentuonti',
        label: 'NAVI_OPPIJOIDEN_TUONTI',
        sallitutRoolit: ['OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'],
    },
];

export const virkailijaNavigation = [
    {
        path: '/virkailijahaku',
        label: 'VIRKAILIJAHAKU',
        sallitutRoolit: [
            'KAYTTOOIKEUS_REKISTERINPITAJA',
            'KAYTTOOIKEUS_READ',
            'KAYTTOOIKEUS_CRUD',
            'KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT',
        ],
    },
    {
        path: '/anomukset',
        label: 'NAVI_KAYTTOOIKEUSANOMUKSET',
        sallitutRoolit: ['KAYTTOOIKEUS_REKISTERINPITAJA', 'KAYTTOOIKEUS_READ', 'KAYTTOOIKEUS_CRUD'],
    },
    {
        path: '/kutsutut',
        label: 'NAVI_KUTSUTUT',
        sallitutRoolit: ['KAYTTOOIKEUS_REKISTERINPITAJA', 'KAYTTOOIKEUS_READ', 'KAYTTOOIKEUS_CRUD'],
    },
    {
        path: '/kutsulomake',
        label: 'NAVI_VIRKAILIJAN_KUTSUMINEN',
        sallitutRoolit: ['KAYTTOOIKEUS_REKISTERINPITAJA', 'KAYTTOOIKEUS_READ', 'KAYTTOOIKEUS_CRUD'],
    },
    {
        path: '/raportit/kayttooikeudet',
        label: 'KAYTTOOIKEUSRAPORTTI_TITLE',
        sallitutRoolit: ['KAYTTOOIKEUS_REKISTERINPITAJA', 'KAYTTOOIKEUS_ACCESS_RIGHTS_REPORT'],
    },
];

export const jarjestelmatunnusNavigation = [
    { path: '/jarjestelmatunnus', label: 'JARJESTELMATUNNUSTEN_HAKU' },
    { path: '/jarjestelmatunnus/luonti', label: 'JARJESTELMATUNNUSTEN_LUONTI' },
];
