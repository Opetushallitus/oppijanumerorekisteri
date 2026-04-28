import React, { useState } from 'react';

import Button from './Button';

type OwnProps = {
    action: () => void;
    normalLabel?: string;
    confirmLabel?: string;
    disabled?: boolean;
    className?: string;
    removeNotification?: () => void;
};

const ConfirmButton = (props: OwnProps) => {
    const { action, className, confirmLabel, disabled, normalLabel } = props;
    const [confirmState, setConfirmState] = useState(false);
    const actionFunction = () => {
        setConfirmState(false);
        action();
    };
    const confirmProps = { ...props, cancel: false, action: actionFunction };

    return !confirmState ? (
        <Button className={className} {...props} action={() => setConfirmState(true)} disabled={disabled}>
            {normalLabel}
        </Button>
    ) : (
        <Button className={className} confirm {...confirmProps}>
            {confirmLabel}
        </Button>
    );
};

export default ConfirmButton;
