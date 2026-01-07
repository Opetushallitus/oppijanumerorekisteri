import type { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioNameLookup, OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';
import type { Locale } from '../types/locale.type';
import type { OrganisaatioSelectObject } from '../types/organisaatioselectobject.types';
import { getLocalization } from './localisation.util';

/*
 * Apufunktio kutsumaan organisaatioHierarkiaToOrganisaatioSelectObject:a käyttöoikeuspalvelusta haetuilla omilla organisaatioilla
 */
export const omattiedotOrganisaatiotToOrganisaatioSelectObject = (
    organisaatiot: OrganisaatioHenkilo[],
    orgNames: OrganisaatioNameLookup,
    locale: Locale
): OrganisaatioSelectObject[] => {
    const omatOrganisaatiot = organisaatiot.map((o) => o.organisaatio);
    const allOrganisaatioSelectObjects: OrganisaatioSelectObject[] =
        organisaatiot.length > 0
            ? organisaatioHierarkiaToOrganisaatioSelectObject(omatOrganisaatiot, orgNames, locale)
            : [];
    const organisaatioSelectObjects = allOrganisaatioSelectObjects.filter(
        (organisaatio: OrganisaatioSelectObject) => !isRyhma(organisaatio)
    );
    return uniqBy((o) => o.oid, organisaatioSelectObjects);
};

function uniqBy(iteratee: (org: OrganisaatioSelectObject) => string, array: OrganisaatioSelectObject[]) {
    const transformedResults = new Set();
    const result = [];
    for (const element of array) {
        const transformedElement = iteratee(element);
        if (!transformedResults.has(transformedElement)) {
            transformedResults.add(transformedElement);
            result.push(element);
        }
    }

    return result;
}

/*
 * Parsii organisaatiohierarkiasta arrayn OrganisaatioSelectObject:a
 */
const organisaatioHierarkiaToOrganisaatioSelectObject = (
    organisaatioHierarkia: OrganisaatioWithChildren[],
    orgNames: OrganisaatioNameLookup,
    locale: Locale
): OrganisaatioSelectObject[] => {
    const result: OrganisaatioSelectObject[] = [];
    mapOrganisaatioLevelsRecursively(organisaatioHierarkia, orgNames, locale, result);
    return result;
};

/*
 * Käy organisaatiohierarkian rekursiivisesti läpi ja palauttaa flatin listan OrganisaatioSelectObjecteja
 */
const mapOrganisaatioLevelsRecursively = (
    organisaatiot: OrganisaatioWithChildren[],
    orgNames: OrganisaatioNameLookup,
    locale: Locale,
    result: OrganisaatioSelectObject[]
): void => {
    organisaatiot.filter(Boolean).forEach((organisaatio: OrganisaatioWithChildren) => {
        const organisaatioSelectObject: OrganisaatioSelectObject = createOrganisaatioSelectObject(
            organisaatio,
            orgNames,
            locale
        );

        result.push(organisaatioSelectObject);

        if (organisaatio.children) {
            mapOrganisaatioLevelsRecursively(organisaatio.children, orgNames, locale, result);
        }
    });
};

const resolveParentNames = (parentOidPath: string, orgNames: OrganisaatioNameLookup, locale: Locale): string[] => {
    const path = parentOidPath.split('/');
    path.shift();
    return path.map((oid) => orgNames[oid]?.[locale] || oid);
};

const createOrganisaatioSelectObject = (
    organisaatio: OrganisaatioWithChildren,
    orgNames: OrganisaatioNameLookup,
    locale: Locale
): OrganisaatioSelectObject => {
    return {
        oid: organisaatio.oid,
        parentNames: resolveParentNames(organisaatio.parentOidPath, orgNames, locale),
        name: getLocalization(organisaatio.nimi, locale),
        status: organisaatio.status,
        organisaatiotyypit: organisaatio.tyypit || [],
        oidPath: organisaatio.parentOidPath,
    };
};

const isRyhma = (organisaatio: OrganisaatioSelectObject): boolean =>
    organisaatio.organisaatiotyypit && organisaatio.organisaatiotyypit.includes('Ryhma');

/*
 * Apufunktio kutsumaan findOrganisaatioOrRyhmaByOid:a käyttöoikeuspalvelusta haetuilla omilla organisaatioilla
 */
export const findOmattiedotOrganisatioOrRyhmaByOid = (
    oid: string,
    organisaatiot: OrganisaatioHenkilo[],
    orgNames: OrganisaatioNameLookup,
    locale: Locale
): OrganisaatioSelectObject | null | undefined => {
    const omatOrganisaatiot = organisaatiot.map((o) => o.organisaatio);
    const allOrganisaatioSelectObjects: OrganisaatioSelectObject[] =
        organisaatiot.length > 0
            ? organisaatioHierarkiaToOrganisaatioSelectObject(omatOrganisaatiot, orgNames, locale)
            : [];
    return allOrganisaatioSelectObjects.find((o) => o.oid === oid);
};
