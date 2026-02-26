import React, { useState } from 'react';

import Button from '../../button/Button';
import { useLocalisations } from '../../../../selectors';
import { SpinnerInButton } from '../../icons/SpinnerInButton';

type OwnProps = {
    discardAction: () => void;
    updateAction: () => Promise<void>;
    isValidForm: boolean;
};

const EditButtons = (props: OwnProps) => {
    const { L } = useLocalisations();
    const [updating, setUpdating] = useState(false);

    const update = async () => {
        setUpdating(true);
        try {
            await props.updateAction();
        } catch (_e) {
            // updateAction must handle errors
        }
        setUpdating(false);
    };

    return (
        <div>
            <Button className="edit-button-discard-button" key="discard" cancel action={props.discardAction}>
                {L('PERUUTA_LINKKI')}
            </Button>
            <Button
                className="edit-button-update-button"
                key="update"
                disabled={!props.isValidForm || updating}
                action={update}
            >
                <SpinnerInButton show={updating} /> {L('TALLENNA_LINKKI')}
            </Button>
        </div>
    );
};

export default EditButtons;
