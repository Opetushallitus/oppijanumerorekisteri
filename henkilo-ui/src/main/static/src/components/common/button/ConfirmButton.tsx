import './Button.css';
import React, { useEffect, useState } from 'react';

import NotificationButton, { ButtonNotification } from './NotificationButton';

type OwnProps = {
    action: () => void;
    normalLabel: string;
    confirmLabel: string;
    disabled?: boolean;
    className?: string;
    notification?: ButtonNotification;
    removeNotification?: () => void;
};

type Props = OwnProps;

const ConfirmButton = (props: Props) => {
    const { action, className, confirmLabel, disabled, normalLabel, notification } = props;
    const [confirmState, setConfirmState] = useState(false);
    const [disabledState, setDisabledState] = useState(false);
    const actionFunction = () => {
        setConfirmState(false);
        action();
    };
    const confirmProps = { ...props, cancel: false, action: actionFunction };

    useEffect(() => {
        if (notification) {
            setConfirmState(false);
            setDisabledState(true);
        }
        const timer = setTimeout(() => {
            setDisabledState(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [notification]);

    return !confirmState ? (
        <NotificationButton
            className={className}
            {...props}
            action={() => setConfirmState(true)}
            disabled={disabledState || disabled}
        >
            {normalLabel}
        </NotificationButton>
    ) : (
        <NotificationButton className={className} confirm {...confirmProps}>
            {confirmLabel}
        </NotificationButton>
    );
};

export default ConfirmButton;
