import React from 'react';
import * as R from 'ramda';
import { toLocalizedText } from '../localizabletext';
import type { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';
import type { Locale } from '../types/locale.type';
import createFilterOptions from 'react-select-fast-filter-options';
import { OrganisaatioSelectObject } from '../types/organisaatioselectobject.types';
import { getLocalization } from './localisation.util';
import PropertySingleton from '../globals/PropertySingleton';

/*
 * Apufunktio kutsumaan organisaatioHierarkiaToOrganisaatioSelectObject:a käyttöoikeuspalvelusta haetuilla omilla organisaatioilla
 */
export const omattiedotOrganisaatiotToOrganisaatioSelectObject = (
    organisaatiot: Array<OrganisaatioHenkilo>,
    locale: Locale
): Array<OrganisaatioSelectObject> => {
    const omatOrganisaatiot = R.map(R.prop('organisaatio'))(organisaatiot);
    const allOrganisaatioSelectObjects: Array<OrganisaatioSelectObject> =
        organisaatiot.length > 0 ? organisaatioHierarkiaToOrganisaatioSelectObject(omatOrganisaatiot, locale) : [];
    const organisaatioSelectObjects = allOrganisaatioSelectObjects.filter(
        (organisaatio: OrganisaatioSelectObject) => !isRyhma(organisaatio)
    );
    return R.uniqBy(R.prop('oid'), organisaatioSelectObjects);
};

/*
 * Parsii organisaatiohierarkiasta arrayn OrganisaatioSelectObject:a
 */
export const organisaatioToOrganisaatioSelectObject = (
    organisaatio: OrganisaatioWithChildren,
    locale: Locale
): Array<OrganisaatioSelectObject> => {
    return organisaatioHierarkiaToOrganisaatioSelectObject([organisaatio], locale);
};

/*
 * Parsii organisaatiohierarkiasta arrayn OrganisaatioSelectObject:a
 */
const organisaatioHierarkiaToOrganisaatioSelectObject = (
    organisaatioHierarkia: Array<OrganisaatioWithChildren>,
    locale: Locale
): Array<OrganisaatioSelectObject> => {
    const result = [];
    mapOrganisaatioLevelsRecursively(organisaatioHierarkia, [], locale, result);
    return result;
};

/*
 * Käy organisaatiohierarkian rekursiivisesti läpi ja palauttaa flatin listan OrganisaatioSelectObjecteja
 */
const mapOrganisaatioLevelsRecursively = (
    organisaatiot: Array<OrganisaatioWithChildren>,
    parentNames: Array<string>,
    locale: Locale,
    result: Array<OrganisaatioSelectObject>
): void => {
    organisaatiot.filter(Boolean).forEach((organisaatio: OrganisaatioWithChildren) => {
        const organisaatioSelectObject: OrganisaatioSelectObject = createOrganisaatioSelectObject(
            organisaatio,
            parentNames,
            locale
        );

        result.push(organisaatioSelectObject);

        if (organisaatio.children) {
            const parents =
                organisaatio.oid === PropertySingleton.state.rootOrganisaatioOid
                    ? []
                    : [...organisaatioSelectObject.parentNames, organisaatioSelectObject.name];
            mapOrganisaatioLevelsRecursively(organisaatio.children, parents, locale, result);
        }
    });
};

const createOrganisaatioSelectObject = (
    organisaatio: OrganisaatioWithChildren,
    parentNames: Array<string>,
    locale: Locale
): OrganisaatioSelectObject => {
    return {
        oid: organisaatio.oid,
        parentNames: parentNames,
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
    organisaatiot: Array<OrganisaatioHenkilo>,
    locale: Locale
): OrganisaatioSelectObject | null | undefined => {
    const omatOrganisaatiot = R.map(R.prop('organisaatio'))(organisaatiot);
    const allOrganisaatioSelectObjects: Array<OrganisaatioSelectObject> =
        organisaatiot.length > 0 ? organisaatioHierarkiaToOrganisaatioSelectObject(omatOrganisaatiot, locale) : [];
    return R.find(R.propEq('oid', oid))(allOrganisaatioSelectObjects);
};

const organisaatioHierarchyRoots = (
    orgs: Array<OrganisaatioHenkilo>,
    locale: Locale
): Array<OrganisaatioWithChildren> => {
    // First sort by name:
    orgs = R.sortBy((org: OrganisaatioHenkilo) => toLocalizedText(locale, org.organisaatio.nimi), orgs);
    const byOid = {};
    // Determine direct parent oid and map by oid:
    const mapOrg = (org) => {
        byOid[org.oid] = org;
        if (!org.parentOidPath) {
            org.parentOid = null;
        } else {
            const parents = org.parentOidPath.split('/');
            org.parentOid = parents[1];
        }
        if (!org.children) {
            org.children = [];
        }
        R.forEach(mapOrg, org.children);
    };
    const organisaatios = R.map(R.prop('organisaatio'), orgs);
    R.forEach(mapOrg, organisaatios);
    // Map children by direct parent:
    const roots = [];
    R.forEach((org) => {
        if (org.parentOid) {
            const parent: OrganisaatioWithChildren = byOid[org.parentOid];
            if (parent) {
                // do not add duplicates:
                if (R.findIndex(R.pathEq(['oid'], org.oid))(parent.children) < 0) {
                    parent.children.push(org);
                    parent.children = R.sortBy((o: OrganisaatioWithChildren) => toLocalizedText(locale, o.nimi))(
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
    }, organisaatios);
    return roots;
};

const organizationsFlatInHierarchyOrder = (organizationHierarchyRoots: Array<OrganisaatioWithChildren>) => {
    const result = [];
    const map = (org) => {
        result.push(org);
        if (org.children) {
            org.children.map((child) => (child.parent = org));
            org.children.map(map);
        }
    };
    R.forEach(map, organizationHierarchyRoots);
    return result;
};

const getOrganisaatios = (
    organisaatios: Array<OrganisaatioHenkilo>,
    locale: Locale
): Array<OrganisaatioWithChildren> => {
    const hierarchyRoots = organisaatioHierarchyRoots(organisaatios, locale);
    return organizationsFlatInHierarchyOrder(hierarchyRoots);
};

const mapOrganisaatio = (
    organisaatio: OrganisaatioWithChildren,
    locale: Locale,
    sisallytaTyypit: boolean = true
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
    organisaatios: Array<OrganisaatioWithChildren>,
    isRyhma: boolean
): Array<OrganisaatioWithChildren> => {
    return isRyhma
        ? organisaatios.filter((organisaatio) => organisaatio.tyypit.indexOf('Ryhma') !== -1)
        : organisaatios.filter((organisaatio) => organisaatio.tyypit.indexOf('Ryhma') === -1);
};

export const getOrganisaatioOptionsAndFilter = (
    newOrganisaatios: Array<OrganisaatioHenkilo>,
    locale: Locale,
    isRyhma: boolean
): { options: any; filterOptions: any } => {
    const newOptions = getOrganisationsOrRyhmas(
        getOrganisaatios(newOrganisaatios, locale),
        isRyhma
    ).map((organisaatio) => mapOrganisaatio(organisaatio, locale, !isRyhma));
    // update index (raskas operaatio)
    const index = createFilterOptions({ options: newOptions });
    return {
        options: newOptions
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((option: { value: string; label: string }): any => ({
                value: option.value,
                label: <span>{option.label}</span>,
            })),
        filterOptions: index,
    };
};
