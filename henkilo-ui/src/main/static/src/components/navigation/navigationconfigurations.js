
export const mainNavigation = [
    {path: '/anomukset', label: 'Käyttöoikeusanomukset'},
    {path: '/kutsutut', label: 'Kutsutut'},
    {path: '/kutsulomake', label: 'Virkailijan kutsuminen Opintopolkuun'},
    {path: '/henkilohaku', label: 'Henkilöhaku'},
    {path: '/oppija/luonti', label: 'Oppijan luonti', vainRekisterinpitajalle: true},
];

export const oppijaNavi = oid => [
    {path: '/oppija/' + oid, label: 'Henkilön tiedot'},
    {path: `/oppija/${oid}/duplikaatit`, label: 'Hae duplikaatit', },
];

export const virkailijaNavi = (oid) => [
    {path: `/virkailija/${oid}`, label: 'Henkilön tiedot'},
    {path: `/virkailija/${oid}/duplikaatit`, label: 'Hae duplikaatit', disabled: true},
    {path: `/virkailija/${oid}/vtjvertailu`, label: 'VTJ vertailu', disabled: true}
];

export const adminNavi = (oid) => [
    {path: `/admin/${oid}`, label: 'Henkilön tiedot'},
    {path: `/admin/${oid}/duplikaatit`, label: 'Hae duplikaatit', disabled: true},
    {path: `/admin/${oid}/vtjvertailu`, label: 'VTJ vertailu', disabled: true}
];

export const kayttooikeusryhmatNavigation = [];

export const emptyNavi = [];
