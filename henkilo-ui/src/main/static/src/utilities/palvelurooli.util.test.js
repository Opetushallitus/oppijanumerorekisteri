// @flow

import {
    hasAnyPalveluRooli, hasPalveluRooliByOrganisaatioOid, kayttooikeusMatchesAnyPalveluRooli,
    organisaatioContainsAnyPalveluRooli,
    parsePalveluRoolit
} from "./palvelurooli.util";
import type {
    KayttooikeusOrganisaatiot
} from "../types/domain/kayttooikeus/KayttooikeusPerustiedot.types";

describe('Test organisaatioutilities', () => {


    const kayttooikeus1 = {palvelu: 'OPPIJANUMEROREKISTERI', oikeus: 'DUPLIKAATTINAKYMA'};
    const kayttooikeus2 = {palvelu: 'OPPIJANUMEROREKISTERI', oikeus: 'MANUAALINEN_YKSILOINTI'};
    const kayttooikeus3 = {palvelu: 'KAYTTOOIKEUDET', oikeus: 'TESTIOIKEUS'};
    const palveluRoles1 = ['FOO_ROLE', 'OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA'];
    const palveluRoles2 = ['BAR_ROLE', 'NO_SUCH_ROLE'];


    it('parsePalveluRoolit should parse correct set of palveluroolit', () => {
        const organisaatio1: KayttooikeusOrganisaatiot = { organisaatioOid: '123', kayttooikeudet: [kayttooikeus1, kayttooikeus2] };
        const organisaatio2: KayttooikeusOrganisaatiot = { organisaatioOid: '234', kayttooikeudet: [kayttooikeus3]};
        const organisaatiot = [organisaatio1, organisaatio2];
        expect(parsePalveluRoolit(organisaatiot)).toEqual(
            expect.arrayContaining(['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA', 'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI', 'KAYTTOOIKEUDET_TESTIOIKEUS'])
        );
    });

    it('hasPalveluRooliByOrganisaatioOid should return correct result', () => {
        const organisaatio1: KayttooikeusOrganisaatiot = { organisaatioOid: '123', kayttooikeudet: [kayttooikeus1, kayttooikeus2] };
        const organisaatio2: KayttooikeusOrganisaatiot = { organisaatioOid: '234', kayttooikeudet: [kayttooikeus3]};
        const organisaatiot = [organisaatio1, organisaatio2];
        expect(hasPalveluRooliByOrganisaatioOid(organisaatiot, '123', 'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI')).toBeTruthy();
        expect(hasPalveluRooliByOrganisaatioOid(organisaatiot, '234', 'KAYTTOOIKEUDET_TESTIOIKEUS')).toBeTruthy();
        expect(hasPalveluRooliByOrganisaatioOid(organisaatiot, 'nosuchid', 'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI')).toBeFalsy();
        expect(hasPalveluRooliByOrganisaatioOid(organisaatiot, '234', 'KAYTTOOIKEUDET_VIRHE')).toBeFalsy();
    });

    it('should return correct result for hasAnyPalveluRooli', () => {
        const organisaatio1: KayttooikeusOrganisaatiot = {
            organisaatioOid: '123',
            kayttooikeudet: [kayttooikeus1, kayttooikeus2]
        };
        const organisaatio2: KayttooikeusOrganisaatiot = {organisaatioOid: '234', kayttooikeudet: [kayttooikeus3]};
        const organisaatiot = [organisaatio1, organisaatio2];
        expect(hasAnyPalveluRooli(organisaatiot, palveluRoles1)).toBeTruthy();
        expect(hasAnyPalveluRooli([organisaatio1, organisaatio2], palveluRoles1)).toBeTruthy();
    });

    it('organisaatioContainsAnyPalveluRooli should return correct result', () => {
        const organisaatio: KayttooikeusOrganisaatiot = {
            organisaatioOid: '123',
            kayttooikeudet: [kayttooikeus1, kayttooikeus2]
        };

        expect(organisaatioContainsAnyPalveluRooli(organisaatio, ['FOO' ,'VIRHE'])).toBeFalsy();
        expect(organisaatioContainsAnyPalveluRooli(organisaatio, ['FOO', 'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI'])).toBeTruthy();
    });

    it('should return correct result for kayttooikeusMatchesAnyPalveluRooli', () => {
        expect(kayttooikeusMatchesAnyPalveluRooli(kayttooikeus1, palveluRoles1)).toBeTruthy();
        expect(kayttooikeusMatchesAnyPalveluRooli(kayttooikeus1, palveluRoles2)).toBeFalsy();
        expect(kayttooikeusMatchesAnyPalveluRooli(kayttooikeus2, palveluRoles1)).toBeFalsy();
    });

});
