import React from 'react';
import { TypedNotification } from './TypedNotification';
import './GlobalNotifications.css';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../store';
import { removeGlobalNotification } from '../../../actions/notification.actions';

/*
 * Global notifications ( stored in redux state )
 *
 * @param notificationlist: Array of unique keys from redux state - YOU DON'T HAVE TO PROVIDE THIS
 * @param removeGlobalNotification: Action that cleans given notification key from redux state - YOU DON'T HAVE TO PROVIDE THIS
 */
export const GlobalNotifications = () => {
    const notificationList = useSelector<RootState, GlobalNotificationConfig[]>((state) => state.notificationList);
    const dispatch = useAppDispatch();
    return (
        <div id="global-notifications">
            {notificationList.map((globalNotification: GlobalNotificationConfig) => {
                if (globalNotification.autoClose) {
                    setTimeout(() => {
                        dispatch(removeGlobalNotification(globalNotification.key));
                    }, globalNotification.autoClose);
                }

                return (
                    <TypedNotification
                        type={globalNotification.type}
                        title={globalNotification.title}
                        key={globalNotification.key}
                        closeAction={() => dispatch(removeGlobalNotification(globalNotification.key))}
                        dataTestId={globalNotification.key}
                    />
                );
            })}
        </div>
    );
};
