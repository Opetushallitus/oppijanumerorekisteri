import React, { SyntheticEvent } from 'react';
import type { RootState } from '../../../../store';
import { useSelector } from 'react-redux';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Oid = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_OID',
                value: henkilo.henkilo.oidHenkilo,
                inputValue: 'oidHenkilo',
                readOnly: true,
            }}
        />
    );
};

export default Oid;
