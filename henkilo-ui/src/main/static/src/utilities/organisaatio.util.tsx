import { Options } from 'react-select';
import createFilterOptions from 'react-select-fast-filter-options';
import { findIndex, pathEq, sortBy, uniqBy } from 'ramda';

import { toLocalizedText } from '../localizabletext';
import type { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';
import type { Locale } from '../types/locale.type';
import type { OrganisaatioNameLookup } from '../reducers/organisaatio.reducer';
import type { OrganisaatioSelectObject } from '../types/organisaatioselectobject.types';
import { getLocalization } from './localisation.util';
import { RyhmatState } from '../reducers/ryhmat.reducer';

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

/*
 * Parsii organisaatiohierarkiasta arrayn OrganisaatioSelectObject:a
 */
const organisaatioHierarkiaToOrganisaatioSelectObject = (
    organisaatioHierarkia: OrganisaatioWithChildren[],
    orgNames: OrganisaatioNameLookup,
    locale: Locale
): OrganisaatioSelectObject[] => {
    const result = [];
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

const organisaatioHierarchyRoots = (orgs: OrganisaatioHenkilo[], locale: Locale): Array<OrganisaatioWithChildren> => {
    // First sort by name:
    orgs = sortBy((org: OrganisaatioHenkilo) => toLocalizedText(locale, org.organisaatio?.nimi), orgs);
    const byOid = {};
    // Determine direct parent oid and map by oid:
    const mapOrg = (oldOrg: OrganisaatioWithChildren) => {
        const org = { ...oldOrg };
        byOid[org.oid] = org;
        if (!org.parentOidPath) {
            org.parentOid = null;
        } else {
            const parents = org.parentOidPath.split('/');
            org.parentOid = parents[1];
        }
        org.children = (org.children ?? []).map(mapOrg);
        return org;
    };
    // clone organisaatios for now since rtk createApi responses have Object.preventExtensions and we're mutating here...
    const organisaatios = orgs.map((o) => o.organisaatio).map(mapOrg);
    // Map children by direct parent:
    const roots = [];
    organisaatios.forEach((org: OrganisaatioWithChildren) => {
        if (org.parentOid) {
            const parent = byOid[org.parentOid];
            if (parent) {
                // do not add duplicates:
                if (findIndex(pathEq(org.oid, ['oid']), parent.children) < 0) {
                    parent.children.push(org);
                    parent.children = sortBy((o: OrganisaatioWithChildren) => toLocalizedText(locale, o.nimi))(
                        parent.children
                    );
                }
            } else {
                // not the root org but root can not be found (=> makes this lowest accessable)
                roots.push(org);
            }
        } else {
            // root org:
            roots.push(org);
        }
    });
    return roots;
};

const organizationsFlatInHierarchyOrder = (organizationHierarchyRoots: OrganisaatioWithChildren[]) => {
    const result: OrganisaatioWithChildren[] = [];
    const flatten = (org: OrganisaatioWithChildren) => {
        result.push(org);
        if (org.children) {
            org.children.forEach((child) => (child.parent = org));
            org.children.forEach(flatten);
        }
    };
    organizationHierarchyRoots.forEach(flatten);
    return result;
};

const getOrganisaatios = (organisaatios: OrganisaatioHenkilo[], locale: Locale): OrganisaatioWithChildren[] => {
    const hierarchyRoots = organisaatioHierarchyRoots(organisaatios, locale);
    return organizationsFlatInHierarchyOrder(hierarchyRoots);
};

const mapOrganisaatio = (
    organisaatio: OrganisaatioWithChildren,
    locale: Locale,
    sisallytaTyypit = true
): { value: string; label: string } => {
    const nimi = toLocalizedText(locale, organisaatio.nimi);
    const tyypit = sisallytaTyypit ? ` (${organisaatio.tyypit.join(',')})` : '';
    return {
        value: organisaatio.oid,
        label: `${nimi}${tyypit}`,
    };
};

// Filter off organisations or ryhmas depending on isRyhma value.
const getOrganisationsOrRyhmas = (
    organisaatios: OrganisaatioWithChildren[],
    isRyhma: boolean
): OrganisaatioWithChildren[] => {
    return isRyhma
        ? organisaatios.filter((organisaatio) => organisaatio.tyypit.indexOf('Ryhma') !== -1)
        : organisaatios.filter((organisaatio) => organisaatio.tyypit.indexOf('Ryhma') === -1);
};

export const getOrganisaatioOptionsAndFilter = (
    newOrganisaatios: OrganisaatioHenkilo[],
    locale: Locale,
    isRyhma: boolean
): { options: Options<string>; filterOptions: ReturnType<createFilterOptions> } => {
    const newOptions = getOrganisationsOrRyhmas(getOrganisaatios(newOrganisaatios, locale), isRyhma).map(
        (organisaatio) => mapOrganisaatio(organisaatio, locale, !isRyhma)
    );
    // update index (raskas operaatio)
    const index = createFilterOptions({ options: newOptions });
    return {
        options: newOptions.sort((a, b) => a.label.localeCompare(b.label)),
        filterOptions: index,
    };
};

export function parseRyhmaOptions(ryhmatState: RyhmatState, locale: string): Array<{ label: string; value: string }> {
    const ryhmat = ryhmatState?.ryhmas;
    return ryhmat
        ? ryhmat
              .map((ryhma) => ({
                  label: ryhma.nimi[locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                  value: ryhma.oid,
              }))
              .sort((a, b) => a.label.localeCompare(b.label))
        : [];
}
