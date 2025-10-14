import React, { SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';

type OwnProps = {
    readOnly: boolean;
    updateModelFieldAction?: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Etunimet = (props: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    return (
        <LabelValue
            updateModelFieldAction={props.updateModelFieldAction}
            readOnly={props.readOnly}
            values={{
                label: 'HENKILO_ETUNIMET',
                value: henkilo.henkilo.etunimet,
                inputValue: 'etunimet',
                disabled: StaticUtils.isVahvastiYksiloity(henkilo.henkilo),
            }}
        />
    );
};

export default Etunimet;
