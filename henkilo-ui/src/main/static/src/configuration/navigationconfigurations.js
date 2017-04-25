
export const mainNavigation = [
    {path: '/anomukset', label: 'Käyttöoikeusanomukset'},
    {path: '/kutsutut', label: 'Kutsutut'},
    {path: '/kutsulomake', label: 'Virkailijan kutsuminen Opintopolkuun'},
    {path: '/henkilo', label: 'Henkilöhaku'},
    {path: '/omattiedot', label: 'Omat tiedot'}
];

export const oppijaNavi = oid => [
    {path: '/oppija/' + oid, label: 'Henkilön tiedot'},
];

export const virkailijaNavi = oid => [
    {path: '/virkailija/' + oid, label: 'Henkilön tiedot'},
    {path: '/virkailija/duplikaatit', label: 'Hae duplikaatit'}
];

export const adminNavi = oid => [
    {path: '/admin/' + oid, label: 'Henkilön tiedot'},
    {path: '/admin/duplikaatit', label: 'Hae duplikaatit'}
];
