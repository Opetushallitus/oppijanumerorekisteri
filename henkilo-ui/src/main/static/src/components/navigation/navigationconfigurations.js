// @flow

import type {Tab} from "../../types/tab.types";

export const mainNavigation: Array<Tab> = [
    {path: '/anomukset', label: 'NAVI_KAYTTOOIKEUSANOMUKSET'},
    {path: '/kutsutut', label: 'NAVI_KUTSUTUT'},
    {path: '/kutsulomake', label: 'NAVI_VIRKAILIJAN_KUTSUMINEN'},
    {path: '/henkilohaku', label: 'NAVI_HENKILOHAKU'},
    {path: '/oppija/luonti', label: 'NAVI_OPPIJAN_LUONTI', sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI']},
    {path: '/oppijoidentuonti', label: 'NAVI_OPPIJOIDEN_TUONTI', sallitutRoolit: ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI']},
];

export const palvelukayttajaNavigation: Array<Tab> = [
    {path: '/palvelukayttaja', label: 'NAVI_PALVELUKAYTTAJA_HAKU'},
    {path: '/palvelukayttaja/luonti', label: 'NAVI_PALVELUKAYTTAJA_LUONTI'},
];

export const oppijaNavi = (oid: string): Array<Tab> => [
    {path: '/oppija/' + oid, label: 'NAVI_HENKILON_TIEDOT'},
    {path: `/oppija/${oid}/duplikaatit`, label: 'NAVI_HAE_DUPLIKAATIT', sallitutRoolit: ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'] },
    {path: `/oppija/${oid}/vtjvertailu`, label: 'NAVI_VTJ_VERTAILU', disabled: true, sallitutRoolit: ['OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA', 'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI'] }
];

export const virkailijaNavi = (oid: string): Array<Tab> => [
    {path: `/virkailija/${oid}`, label: 'NAVI_HENKILON_TIEDOT'},
    {path: `/virkailija/${oid}/duplikaatit`, label: 'NAVI_HAE_DUPLIKAATIT', disabled: true, sallitutRoolit: ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA'] },
    {path: `/virkailija/${oid}/vtjvertailu`, label: 'NAVI_VTJ_VERTAILU', disabled: true, sallitutRoolit: ['OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA'] }
];

export const emptyNavi: Array<Tab> = [];
