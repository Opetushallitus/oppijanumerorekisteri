// @flow
import React from 'react';
import * as R from 'ramda';
import {toLocalizedText} from '../../localizabletext';
import type {Organisaatio, OrganisaatioHenkilo} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {Locale} from "../../types/locale.type";
import createFilterOptions from 'react-select-fast-filter-options';

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

export const getOrganisaatios = (organisaatios: Array<OrganisaatioHenkilo>, locale: Locale) => {
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
