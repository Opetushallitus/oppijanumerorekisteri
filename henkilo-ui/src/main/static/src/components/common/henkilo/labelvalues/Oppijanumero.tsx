import React, { SyntheticEvent } from 'react';

import LabelValue from './LabelValue';
import { useGetHenkiloMasterQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Oppijanumero = (props: OwnProps) => {
    const { data: master } = useGetHenkiloMasterQuery(props.henkiloOid);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_OPPIJANUMERO',
                value: master?.oppijanumero,
                inputValue: 'oppijanumero',
                readOnly: true,
            }}
        />
    );
};

export default Oppijanumero;
