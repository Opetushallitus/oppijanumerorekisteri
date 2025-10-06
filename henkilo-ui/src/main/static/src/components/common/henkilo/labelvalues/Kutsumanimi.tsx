import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    isError?: boolean;
    readOnly: boolean;
    updateModelFieldAction: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
    defaultValue?: string;
};

const Kutsumanimi = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_KUTSUMANIMI',
                value: props.defaultValue || henkilo.henkilo.kutsumanimi,
                inputValue: 'kutsumanimi',
                isError: props.isError,
            }}
        />
    );
};

export default Kutsumanimi;
