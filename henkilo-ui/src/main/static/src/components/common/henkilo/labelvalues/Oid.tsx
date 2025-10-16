import React, { SyntheticEvent } from 'react';

import LabelValue from './LabelValue';

type OwnProps = {
    henkiloOid: string;
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Oid = (props: OwnProps) => {
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_OID',
                value: props.henkiloOid,
                inputValue: 'oidHenkilo',
                readOnly: true,
            }}
        />
    );
};

export default Oid;
