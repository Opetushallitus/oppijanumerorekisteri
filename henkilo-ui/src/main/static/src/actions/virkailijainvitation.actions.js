import {KUTSU_ADD_ORGANISAATIO, KUTSU_REMOVE_ORGANISAATIO, KUTSU_CLEAR_ORGANISAATIOS} from './actiontypes';

export const virkailijaInvitationAddOrganisaatio = organisaatio => dispatch => dispatch({type: KUTSU_ADD_ORGANISAATIO, organisaatio});
export const virkailijaInvitationRemoveOrganisaatio = organisaatioOid => dispatch => dispatch({type: KUTSU_REMOVE_ORGANISAATIO, organisaatioOid});
export const virkailijaInvitationClearOrganisaatios = () => dispatch => dispatch({type: KUTSU_CLEAR_ORGANISAATIOS});

