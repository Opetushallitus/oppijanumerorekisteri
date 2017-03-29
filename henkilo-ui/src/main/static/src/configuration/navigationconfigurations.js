
export const mainNavigation = [
    {path: '/anomukset', label: 'Käyttöoikeusanomukset'},
    {path: '/kutsutut', label: 'Kutsutut'},
    {path: '/kutsulomake', label: 'Virkailijan kutsuminen Opintopolkuun'},
    {path: '/henkilo', label: 'Henkilöhaku'}
];

export const henkiloNavi = oid => [
    {path: '/henkilo/' + oid, label: 'Henkilön tiedot'},
    {path: '/henkilo/duplikaatit', label: 'Hae duplikaatit'}
];
