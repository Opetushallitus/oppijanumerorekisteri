import { AnyAction } from '@reduxjs/toolkit';
import {
    KUTSU_ADD_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_REMOVE_ORGANISAATIO,
    KUTSU_SET_ORGANISAATIO,
    KUTSU_ORGANISAATIO_SET_PROPERTIES,
    ADD_ORGANISAATIO_PERMISSION,
    REMOVE_ORGANISAATIO_PERMISSION,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE,
} from '../actions/actiontypes';
import { KutsuOrganisaatio } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';

export type KutsuminenOrganisaatiosState = readonly KutsuOrganisaatio[];

export const kutsuminenOrganisaatios = (
    state: KutsuminenOrganisaatiosState = [], // NOSONAR
    action: AnyAction
): KutsuminenOrganisaatiosState => {
    const newOrganisaatios = [...state];
    let kutsu: KutsuOrganisaatio | undefined;
    switch (action.type) {
        case KUTSU_ADD_ORGANISAATIO:
            newOrganisaatios.push(action.organisaatio);
            return newOrganisaatios;
        case KUTSU_SET_ORGANISAATIO: {
            const properties = {
                oid: action.organisaatio.oid,
                organisation: action.organisaatio,
                selectablePermissions: [],
                selectedPermissions: [],
                isPermissionsLoading: false,
            };
            newOrganisaatios[action.index] = {
                ...newOrganisaatios[action.index],
                ...properties,
            };
            return newOrganisaatios;
        }
        case KUTSU_REMOVE_ORGANISAATIO:
            newOrganisaatios.splice(action.index, 1);
            return [...newOrganisaatios];
        case KUTSU_CLEAR_ORGANISAATIOS:
            return [];
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST: {
            kutsu = newOrganisaatios.find((o) => o.oid === action.oidOrganisation);

            if (kutsu) {
                kutsu.isPermissionsLoading = true;
            }

            return newOrganisaatios;
        }
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS:
            kutsu = newOrganisaatios.find((o) => o.oid === action.oidOrganisation);

            if (kutsu) {
                kutsu.selectablePermissions = action.allowedKayttooikeus;
                kutsu.isPermissionsLoading = false;
            }

            return newOrganisaatios;
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE:
            kutsu = newOrganisaatios.find((o) => o.oid === action.oidOrganisation);

            if (kutsu) {
                kutsu.isPermissionsLoading = false;
            }

            return newOrganisaatios;
        case KUTSU_ORGANISAATIO_SET_PROPERTIES:
            newOrganisaatios[action.index] = {
                ...newOrganisaatios[action.index],
                ...action.properties,
            };
            return newOrganisaatios;
        case ADD_ORGANISAATIO_PERMISSION:
            kutsu = newOrganisaatios.find((o) => o.oid === action.organisaatioOid);

            if (kutsu) {
                kutsu.selectedPermissions.push(action.permission);
                kutsu.selectablePermissions = kutsu.selectablePermissions.filter(
                    (selectablePermission) => selectablePermission.ryhmaId !== action.permission.ryhmaId
                );
            }

            return newOrganisaatios;
        case REMOVE_ORGANISAATIO_PERMISSION:
            kutsu = newOrganisaatios.find((o) => o.oid === action.organisaatioOid);

            if (kutsu) {
                kutsu.selectedPermissions = kutsu.selectedPermissions.filter(
                    (selectedPermission) => selectedPermission.ryhmaId !== action.permission.ryhmaId
                );
                kutsu.selectablePermissions.push(action.permission);
            }

            return newOrganisaatios;
        default:
            return state;
    }
};
