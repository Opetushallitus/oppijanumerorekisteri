import React, { SyntheticEvent } from 'react';

import LabelValue from './LabelValue';
import { isVahvastiYksiloity } from '../../StaticUtils';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Hetu = (props: OwnProps) => {
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_HETU',
                value: henkilo?.hetu,
                inputValue: 'hetu',
                disabled: isVahvastiYksiloity(henkilo),
            }}
        />
    );
};

export default Hetu;
