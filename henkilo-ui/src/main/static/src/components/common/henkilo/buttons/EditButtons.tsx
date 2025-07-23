import React from 'react';

import Button from '../../button/Button';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    discardAction: () => void;
    updateAction: () => void;
    isValidForm: boolean;
};

const EditButtons = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <div>
            <Button className="edit-button-discard-button" key="discard" cancel action={props.discardAction}>
                {L['PERUUTA_LINKKI']}
            </Button>
            <Button
                className="edit-button-update-button"
                key="update"
                disabled={!props.isValidForm}
                action={props.updateAction}
            >
                {L['TALLENNA_LINKKI']}
            </Button>
        </div>
    );
};

export default EditButtons;
