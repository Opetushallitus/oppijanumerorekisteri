import {
    KayttooikeusOikeudet,
    KayttooikeusOrganisaatiot,
} from "../types/domain/kayttooikeus/KayttooikeusPerustiedot.types"

/*
 * Parse all palveluroolit to an array of strings eg. ['OPPIJANUMEROREKISTERI_DUPLIKAATTINAKYMA', ...]
 * Note that resulting list contains all palveluroolit from all organisaatiot
 */
export const parsePalveluRoolit = (
    organisaatiot: Array<KayttooikeusOrganisaatiot>,
): Array<string> => {
    return organisaatiot
        .map((organisaatio: KayttooikeusOrganisaatiot) =>
            organisaatio.kayttooikeudet.map(
                (kayttooikeus: KayttooikeusOikeudet) =>
                    `${kayttooikeus.palvelu}_${kayttooikeus.oikeus}`,
            ),
        )
        .reduce(
            (prev: Array<string>, current: Array<string>) => [
                ...prev,
                ...current,
            ],
            [],
        )
}

/*
 * Find if given organisaatiolist contains given organisaatioOid AND given palvelu & rooli -combination
 */
export const hasPalveluRooliByOrganisaatioOid = (
    organisaatiot: Array<KayttooikeusOrganisaatiot>,
    organisaatioOid: string,
    palveluRooli: string,
): boolean => {
    return organisaatiot
        .filter(
            (organisaatio: KayttooikeusOrganisaatiot) =>
                organisaatio.organisaatioOid === organisaatioOid,
        )
        .some((organisaatio: KayttooikeusOrganisaatiot) =>
            organisaatioContainsAnyPalveluRooli(organisaatio, [palveluRooli]),
        )
}

/*
 * Check if any given organisaatio contains any of the given palvelurooli
 */
export const hasAnyPalveluRooli = (
    organisaatiot: Array<KayttooikeusOrganisaatiot>,
    palveluRoolit: Array<string>,
): boolean => {
    return organisaatiot.some((organisaatio: KayttooikeusOrganisaatiot) =>
        organisaatioContainsAnyPalveluRooli(organisaatio, palveluRoolit),
    )
}

/*
 * Check if given organisaatio contains any of the given palveluRooli
 */
export const organisaatioContainsAnyPalveluRooli = (
    organisaatio: KayttooikeusOrganisaatiot,
    palveluRoolit: Array<string>,
): boolean => {
    return organisaatio.kayttooikeudet.some(
        (kayttooikeus: KayttooikeusOikeudet) =>
            kayttooikeusMatchesAnyPalveluRooli(kayttooikeus, palveluRoolit),
    )
}

/*
 * Check if KayttooikeusOikeudet contains any of the given palvelurooli
 */
export const kayttooikeusMatchesAnyPalveluRooli = (
    kayttooikeus: KayttooikeusOikeudet,
    palveluRoolit: Array<string>,
): boolean => {
    const searchTerm = `${kayttooikeus.palvelu}_${kayttooikeus.oikeus}`
    return palveluRoolit.some(
        (palveluRooli: string) => searchTerm === palveluRooli,
    )
}