// @flow
import React from 'react';
import * as R from 'ramda';
import {toLocalizedText} from '../localizabletext';
import type {Organisaatio, OrganisaatioHenkilo} from "../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {Organisaatio as Org} from "../types/domain/organisaatio/organisaatio.types";
import type {Locale} from "../types/locale.type";
import createFilterOptions from 'react-select-fast-filter-options';
import type {OrganisaatioSelectObject} from "../types/organisaatioselectobject.types";
import {getLocalization} from "./localisation.util";

/*
 * Apufunktio kutsumaan organisaatioHierarkiaToOrganisaatioSelectObject:a käyttöoikeuspalvelusta haetuilla omilla organisaatioilla
 */
export const omattiedotOrganisaatiotToOrganisaatioSelectObject = (organisaatiot: Array<any>, locale: Locale): Array<OrganisaatioSelectObject> => {
    return organisaatiot.length > 0 ? organisaatioHierarkiaToOrganisaatioSelectObject([organisaatiot[0].organisaatio], locale) : []
};

/*
 * Parsii organisaatiohierarkiasta arrayn OrganisaatioSelectObject:a. Käytetään OrganisaatioSelectModal/OrganisaatioSelect:ssa
 */
export const organisaatioHierarkiaToOrganisaatioSelectObject = (organisaatioHierarkia: Array<Org>, locale: Locale): Array<OrganisaatioSelectObject> => {
    const result = [];
    mapOrganisaatioLevelsRecursively(organisaatioHierarkia, [], locale, result);
    return result;
};

/*
 * Käy organisaatiohierarkian rekursiivisesti läpi ja palauttaa flatin listan OrganisaatioSelectObjecteja
 */
const mapOrganisaatioLevelsRecursively = (organisaatiot: Array<Org>, parentNames: Array<string>, locale: Locale, result: Array<OrganisaatioSelectObject>): void => {
    organisaatiot.forEach( (organisaatio: Org) => {
        const organisaatioSelectObject: OrganisaatioSelectObject = createOrganisaatioSelectObject(organisaatio, parentNames, locale);

        if(!isRyhma(organisaatioSelectObject)) {
            result.push(organisaatioSelectObject);
        }

        if(organisaatio.children) {
            mapOrganisaatioLevelsRecursively(organisaatio.children, [...organisaatioSelectObject.parentNames, organisaatioSelectObject.name], locale, result);
        }

    });
};

export const createOrganisaatioSelectObject = (organisaatio: Org, parentNames: Array<string>, locale: Locale): OrganisaatioSelectObject => {
    return {
        oid: organisaatio.oid,
        parentNames: parentNames,
        name: getLocalization(organisaatio.nimi, locale),
        organisaatiotyypit: organisaatio.organisaatiotyypit || organisaatio.tyypit || [] // organisaatiopalvelusta suoraan tulevista organisaatioista 'organisaatiotyypit', kayttooikeuspalvelusta tulevista organisaatioista 'tyypit'
    }
};

const isRyhma = (organisaatio: OrganisaatioSelectObject): boolean => organisaatio.organisaatiotyypit && organisaatio.organisaatiotyypit.includes('Ryhma');


export const organisaatioHierarchyRoots = (orgs: Array<OrganisaatioHenkilo>, locale: Locale): Array<Organisaatio> => {
    // First sort by name:
    orgs = R.sortBy((org: OrganisaatioHenkilo) => toLocalizedText(locale, org.organisaatio.nimi), orgs);
    const byOid = {};
    let lowestLevel = null;
    // Determine organization levels, lowest level, direct parent oid and map by oid:
    const mapOrg = (org) => {
        byOid[org.oid] = org;
        if (!org.parentOidPath) {
            org.level = 1; // root
            org.parentOid = null;
        }
        else {
            const parents = org.parentOidPath.split('/');
            org.level = parents.length;
            org.parentOid = parents[1];
        }
        if (lowestLevel === null || lowestLevel > org.level) {
            lowestLevel = org.level;
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
    R.forEach(org => {
        if (org.parentOid) {
            const parent: Organisaatio = byOid[org.parentOid];
            if (parent) {
                // do not add duplicates:
                if (R.findIndex(R.pathEq(['oid'], org.oid))(parent.children) < 0) {
                    parent.children.push(org);
                    parent.children = R.sortBy((org: Organisaatio) => toLocalizedText(locale, org.nimi))(parent.children);
                }
            }
            else {
                // not the root org but root can not be found (=> makes this lowest accessable)
                roots.push(org);
            }
        }
        else {
            // root org:
            roots.push(org);
        }
    }, organisaatios);
    return roots;
};

export const organizationsFlatInHierarchyOrder = (organizationHierarchyRoots: Array<Organisaatio>, locale: Locale) => {
    const result = [];
    const map = org => {
        const localisedText = toLocalizedText(locale, org.nimi, '');
        org.fullLocalizedName = (org.parent && org.parent.parentOid
            ? org.parent.fullLocalizedName + " "
            : "") + (localisedText ? localisedText.toLowerCase() : '');
        result.push(org);
        if (org.children) {
            org.children.map(child => child.parent = org);
            org.children.map(map);
        }
    };
    R.forEach(map, organizationHierarchyRoots);
    return result;
};

export const getOrganisaatios = (organisaatios: Array<OrganisaatioHenkilo>, locale: Locale): Array<Organisaatio> => {
    const hierarchyRoots = organisaatioHierarchyRoots(organisaatios, locale);
    return organizationsFlatInHierarchyOrder(hierarchyRoots, locale);
};

export const mapOrganisaatio = (organisaatio: Organisaatio, locale: Locale): {value: string, label: string, level: number} => {
    const organisaatioNimi = org => toLocalizedText(locale, organisaatio.nimi);
    return {
        value: organisaatio.oid,
        label: `${organisaatioNimi(organisaatio)} (${organisaatio.tyypit.join(',')})`,
        level: organisaatio.level
    };
};



// Filter off organisations or ryhmas depending on isRyhma value.
export const getOrganisationsOrRyhmas = (organisaatios: Array<Organisaatio>, isRyhma: boolean): Array<Organisaatio> => {
    return isRyhma
        ? organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') !== -1)
        : organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') === -1);
};

export const getOrganisaatioOptionsAndFilter = (newOrganisaatios: Array<OrganisaatioHenkilo>, locale: Locale, isRyhma: boolean) => {
    const newOptions = getOrganisationsOrRyhmas(getOrganisaatios(newOrganisaatios, locale), isRyhma)
        .map((organisaatio) => mapOrganisaatio(organisaatio, locale));
    // update index
    const index = createFilterOptions({options: newOptions});
    return {
        options: newOptions.map((option: {value: string, level: number, label: string}): any => ({
            value: option.value,
            label: <span className={`organisaatio-level-${option.level}`}>{option.label}</span>
        })),
        filterOptions: index,
    };
};
