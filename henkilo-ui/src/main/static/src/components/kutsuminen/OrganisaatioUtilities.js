import R from 'ramda';
import {toLocalizedText} from '../../localizabletext';
import locale from '../../configuration/locale';

export const organisaatioHierarchyRoots = (orgs, locale) => {
    // First sort by name:
    orgs = R.sortBy(org => toLocalizedText(locale, org.organisaatio.nimi), orgs);
    const byOid = {};
    let lowestLevel = null;
    // Determine organization levels, lowest level, direct parent oid and map by oid:
    const mapOrg = org => {
        byOid[org.oid] = org;
        if (!org.parentOidPath) {
            org.level = 1; // root
            org.parentOid = null;
        } else {
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
            const parent = byOid[org.parentOid];
            if (parent) {
                // do not add duplicates:
                if (R.findIndex(R.pathEq(['oid'], org.oid), parent.children) < 0) {
                    parent.children.push(org);
                    orgs = R.sortBy(org => toLocalizedText(locale, org.nimi), parent.children);
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

export const organizationsFlatInHierarchyOrder = (organizationHierarchyRoots, locale) => {
    const result = [];
    const map = org => {
        org.fullLocalizedName = (org.parent && org.parent.parentOid ? org.parent.fullLocalizedName + " " : "") + toLocalizedText(locale, org.nimi, '').toLowerCase();
        result.push(org);
        if (org.children) {
            org.children.map(child => child.parent =org);
            org.children.map(map);
        }
    };
    R.forEach(map, organizationHierarchyRoots);
    return result;
};

export const getOrganisaatios = organisaatios => {
    const hierarchyRoots = organisaatioHierarchyRoots(organisaatios, locale);
    return organizationsFlatInHierarchyOrder(hierarchyRoots, locale);
};

