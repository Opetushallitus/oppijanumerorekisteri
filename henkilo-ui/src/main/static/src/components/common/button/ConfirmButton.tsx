import './Button.css';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import type { RootState } from '../../../store';
import type { Notification } from '../../../reducers/notifications.reducer';
import NotificationButton from './NotificationButton';

type OwnProps = {
    action: () => void;
    normalLabel: string;
    confirmLabel: string;
    id: string;
    disabled?: boolean;
    className?: string;
};

type StateProps = {
    notifications: Notification[];
};

type Props = OwnProps & StateProps;

const ConfirmButton = (props: Props) => {
    const { action, className, confirmLabel, disabled, id, normalLabel, notifications } = props;
    const [confirmState, setConfirmState] = useState(false);
    const [disabledState, setDisabledState] = useState(false);
    const actionFunction = () => {
        setConfirmState(false);
        action();
    };
    const confirmProps = { ...props, cancel: false, action: actionFunction };

    useEffect(() => {
        if (notifications.find((n) => n.id === id)) {
            setConfirmState(false);
            setDisabledState(true);
        }
        const timer = setTimeout(() => {
            setDisabledState(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [notifications, id]);

    return !confirmState ? (
        <NotificationButton
            className={className}
            {...props}
            action={() => setConfirmState(true)}
            disabled={disabledState || disabled}
            id={id}
        >
            {normalLabel}
        </NotificationButton>
    ) : (
        <NotificationButton className={className} confirm {...confirmProps} id={id}>
            {confirmLabel}
        </NotificationButton>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    notifications: state.notifications.buttonNotifications,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(ConfirmButton);
