import React, { SyntheticEvent } from 'react';

import LabelValue from './LabelValue';
import { isVahvastiYksiloity } from '../../StaticUtils';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    readOnly: boolean;
    autofocus?: boolean;
    updateModelFieldAction?: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
    label?: string;
};

const Sukunimi = (props: OwnProps) => {
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            autofocus={props.autofocus}
            values={{
                label: props.label || 'HENKILO_SUKUNIMI',
                value: henkilo?.sukunimi,
                inputValue: 'sukunimi',
                disabled: isVahvastiYksiloity(henkilo),
            }}
        />
    );
};

export default Sukunimi;
