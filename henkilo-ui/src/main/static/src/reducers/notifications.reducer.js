import {
    ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE, ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS,
    NOTIFICATION_REMOVED
} from "../actions/actiontypes";

export const notifications = (state={existingKayttooikeus: [],}, action) => {
    switch (action.type) {
        case ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS:
            return {
                ...state,
                existingKayttooikeus: [...state.existingKayttooikeus, {
                    type: 'ok',
                    notL10nMessage: 'NOTIFICATION_LISAA_KAYTTOOIKEUS_ONNISTUI',
                    organisaatioOid: action.organisaatioOid,
                    ryhmaIdList: action.ryhmaIdList,
                }],
            };
        case ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE:
            return {
                ...state,
                existingKayttooikeus: [...state.existingKayttooikeus, {
                    type: 'error',
                    notL10nMessage: action.notL10nMessage || 'NOTIFICATION_LISAA_KAYTTOOIKEUS_EPAONNISTUI',
                    id: action.id,
                }],
            };
        case NOTIFICATION_REMOVED:
            const removeNotification = action.id
                ? state[action.group].filter(notification => action.id === notification.organisaatioOid + notification.ryhmaIdList.join(''))[0]
                : state[action.group].filter(notification => notification.type === action.status)[0];
            return Object.assign({}, state, {[action.group]: state[action.group].filter(notification => notification !== removeNotification)});
        default:
            return state;
    }
};
