import React, { SyntheticEvent } from 'react';

import type { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import LabelValue from './LabelValue';

type OwnProps = {
    readOnly: boolean;
    henkiloUpdate: Henkilo;
    updateDateFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Syntymaaika = (props: OwnProps) => {
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateDateFieldAction={props.updateDateFieldAction}
            values={{
                label: 'HENKILO_SYNTYMAAIKA',
                inputValue: 'syntymaaika',
                date: true,
                value: props.henkiloUpdate.syntymaaika,
                disabled: !!props.henkiloUpdate.hetu,
            }}
        />
    );
};

export default Syntymaaika;
