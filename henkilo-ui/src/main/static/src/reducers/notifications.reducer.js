import {ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE, ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS} from "../actions/actiontypes";

export const notifications = (state={existingKayttooikeus: [],}, action) => {
    switch (action.type) {
        case ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS:
            return {
                ...state,
                existingKayttooikeus: [...state.existingKayttooikeus, {
                    type: 'ok',
                    notL10nMessage: 'NOTIFICATION_LISAA_KAYTTOOIKEUS_ONNISTUI'
                }],
            };
        case ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE:
            return {
                ...state,
                existingKayttooikeus: [...state.existingKayttooikeus, {
                    type: 'error',
                    notL10nMessage: action.notL10nMessage || 'NOTIFICATION_LISAA_KAYTTOOIKEUS_EPAONNISTUI',
                }],
            };
        default:
            return state;
    }
};
