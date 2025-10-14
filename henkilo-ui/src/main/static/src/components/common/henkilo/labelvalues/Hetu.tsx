import React, { SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Hetu = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_HETU',
                value: henkilo.henkilo.hetu,
                inputValue: 'hetu',
                disabled: StaticUtils.isVahvastiYksiloity(henkilo.henkilo),
            }}
        />
    );
};

export default Hetu;
