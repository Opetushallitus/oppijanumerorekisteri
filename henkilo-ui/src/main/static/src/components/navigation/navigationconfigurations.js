
export const mainNavigation = [
    {path: '/anomukset', label: 'NAVI_KAYTTOOIKEUSANOMUKSET'},
    {path: '/kutsutut', label: 'NAVI_KUTSUTUT'},
    {path: '/kutsulomake', label: 'NAVI_VIRKAILIJAN_KUTSUMINEN'},
    {path: '/henkilohaku', label: 'NAVI_HENKILOHAKU'},
    {path: '/oppija/luonti', label: 'NAVI_OPPIJAN_LUONTI', sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI']},
];

export const oppijaNavi = oid => [
    {path: '/oppija/' + oid, label: 'NAVI_HENKILON_TIEDOT'},
    {path: `/oppija/${oid}/duplikaatit`, label: 'NAVI_HAE_DUPLIKAATIT', sallitutRoolit: ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA'] },
];

export const virkailijaNavi = (oid) => [
    {path: `/virkailija/${oid}`, label: 'NAVI_HENKILON_TIEDOT'},
    {path: `/virkailija/${oid}/duplikaatit`, label: 'NAVI_HAE_DUPLIKAATIT', disabled: true, sallitutRoolit: ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA'] },
    {path: `/virkailija/${oid}/vtjvertailu`, label: 'NAVI_VTJ_VERTAILU', disabled: true, sallitutRoolit: ['OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA'] }
];

export const adminNavi = (oid) => [
    {path: `/admin/${oid}`, label: 'NAVI_HENKILON_TIEDOT'},
    {path: `/admin/${oid}/duplikaatit`, label: 'NAVI_HAE_DUPLIKAATIT', disabled: true},
    {path: `/admin/${oid}/vtjvertailu`, label: 'NAVI_VTJ_VERTAILU', disabled: true}
];

export const emptyNavi = [];
