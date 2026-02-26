import React from 'react';

import Button from '../../button/Button';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    editAction: () => void;
    disabled?: boolean;
};

const EditButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <Button key="edit" disabled={props.disabled} action={props.editAction}>
            {L('MUOKKAA_LINKKI')}
        </Button>
    );
};

export default EditButton;
