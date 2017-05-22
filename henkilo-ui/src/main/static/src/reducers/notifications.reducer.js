import {
    ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE, ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS, DELETE_HENKILOORGS_FAILURE,
    NOTIFICATION_REMOVED, PASSIVOI_HENKILO_FAILURE, VTJ_OVERRIDE_HENKILO_FAILURE, YKSILOI_HENKILO_FAILURE
} from "../actions/actiontypes";

export const notifications = (state={existingKayttooikeus: [], buttonNotifications: [],}, action) => {
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
            let removeNotifications;
            // For button notifications (remove all)
            removeNotifications = state[action.group].filter(notification => action.id === action.id);
            // For kayttooikeus table notifications (remove single one)
            if(!removeNotifications) {
                removeNotifications  = action.id
                    ? [state[action.group].filter(notification => action.id === notification.organisaatioOid + notification.ryhmaIdList.join(''))[0]]
                    : [state[action.group].filter(notification => notification.type === action.status)[0]];
            }
            return Object.assign({}, state, {[action.group]: state[action.group].filter(notification => removeNotifications.indexOf(notification) === -1)});
        case PASSIVOI_HENKILO_FAILURE:
        case YKSILOI_HENKILO_FAILURE:
        case DELETE_HENKILOORGS_FAILURE:
        case VTJ_OVERRIDE_HENKILO_FAILURE:
            return Object.assign({}, state, {
                ...state,
                buttonNotifications: [...state.buttonNotifications, {
                    type: 'error',
                    notL10nMessage: action.buttonNotification.notL10nMessage,
                    notL10nText: action.buttonNotification.notL10nText,
                    id: action.buttonNotification.position,
                }],
            });
        default:
            return state;
    }
};
