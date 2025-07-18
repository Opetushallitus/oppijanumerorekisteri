import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import type { RootState } from '../../../store';
import type { Localisations } from '../../../types/localisation.type';
import type { Notification } from '../../../reducers/notifications.reducer';
import { removeNotification } from '../../../actions/notifications.actions';
import Button from './Button';

import './NotificationButton.css';

export type ButtonNotification = { notL10nMessage: string; notL10nText?: string };

type OwnProps = {
    id: string;
    action?: () => void;
    disabled?: boolean;
    confirm?: boolean;
    localNotification?: ButtonNotification;
    removeLocalNotification?: () => void;
    children?: ReactNode;
};

type StateProps = {
    notifications: Notification[];
    L: Localisations;
};

type DispatchProps = {
    removeNotification: (status: string, group: string, id: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const NotificationButton = (props: Props) => {
    const { id, L, localNotification, notifications, removeLocalNotification, removeNotification } = props;
    const notification = localNotification ?? notifications.filter((item) => item.id === id)[0];

    const hide = () => {
        if (removeLocalNotification) {
            removeLocalNotification();
        }
        removeNotification('error', 'buttonNotifications', id);
    };

    return (
        <div className="popup-button" style={{ position: 'relative' }}>
            <Button {...props} />
            {notification ? (
                <div className="oph-popup oph-popup-error oph-popup-top">
                    <button
                        className="oph-button oph-button-close"
                        type="button"
                        title="Close"
                        aria-label="Close"
                        onClick={hide}
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                    <div className="oph-popup-arrow" />
                    <div className="oph-popup-title">{L[notification.notL10nMessage]}</div>
                    <div className="oph-popup-content">{L[notification.notL10nText]}</div>
                </div>
            ) : null}
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    notifications: state.notifications.buttonNotifications,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, { removeNotification })(
    NotificationButton
);
