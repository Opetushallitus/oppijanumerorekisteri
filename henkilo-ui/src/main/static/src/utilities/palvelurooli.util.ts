import {
    KayttooikeusOikeudet,
    KayttooikeusOrganisaatiot,
} from '../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';

/*
 * Parse all palveluroolit to an array of strings eg. ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA', ...]
 * Note that resulting list contains all palveluroolit from all organisaatiot
 */
export const parsePalveluRoolit = (organisaatiot?: KayttooikeusOrganisaatiot[]): string[] => {
    return (
        organisaatiot
            ?.map((organisaatio: KayttooikeusOrganisaatiot) =>
                organisaatio.kayttooikeudet.map(
                    (kayttooikeus: KayttooikeusOikeudet) => `${kayttooikeus.palvelu}_${kayttooikeus.oikeus}`
                )
            )
            .reduce((prev, current) => [...prev, ...current], []) ?? []
    );
};

/*
 * Check if given organisaatio contains at least one of the given palvelurooli
 */
export const hasAnyPalveluRooli = (organisaatiot?: KayttooikeusOrganisaatiot[], palveluRoolit?: string[]): boolean => {
    if (!organisaatiot || !palveluRoolit) {
        return false;
    }
    return organisaatiot.some((organisaatio: KayttooikeusOrganisaatiot) =>
        organisaatioContainsAnyPalveluRooli(organisaatio, palveluRoolit)
    );
};

export const isOnrRekisterinpitaja = (organisaatiot?: KayttooikeusOrganisaatiot[]) =>
    hasAnyPalveluRooli(organisaatiot, ['OPPIJANUMEROREKISTERI_REKISTERINPITAJA', 'HENKILONHALLINTA_OPHREKISTERI']);

/*
 * Check if given organisaatio contains at least one of the given palveluRooli
 */
const organisaatioContainsAnyPalveluRooli = (
    organisaatio: KayttooikeusOrganisaatiot,
    palveluRoolit: string[]
): boolean => {
    return organisaatio.kayttooikeudet.some((kayttooikeus: KayttooikeusOikeudet) =>
        kayttooikeusMatchesAnyPalveluRooli(kayttooikeus, palveluRoolit)
    );
};

/*
 * Check if KayttooikeusOikeudet contains at least one of the given palvelurooli
 */
const kayttooikeusMatchesAnyPalveluRooli = (kayttooikeus: KayttooikeusOikeudet, palveluRoolit: string[]): boolean => {
    const searchTerm = `${kayttooikeus.palvelu}_${kayttooikeus.oikeus}`;
    return palveluRoolit.some((palveluRooli: string) => searchTerm === palveluRooli);
};
