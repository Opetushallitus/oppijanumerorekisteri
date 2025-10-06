import React, { SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    autofocus?: boolean;
    updateModelFieldAction?: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    label?: string;
};

const Sukunimi = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            autofocus={props.autofocus}
            values={{
                label: props.label || 'HENKILO_SUKUNIMI',
                value: henkilo.henkilo.sukunimi,
                inputValue: 'sukunimi',
                disabled: StaticUtils.hasHetuAndIsYksiloity(henkilo),
            }}
        />
    );
};

export default Sukunimi;
