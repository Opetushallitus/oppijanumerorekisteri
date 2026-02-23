import React, { SyntheticEvent } from 'react';

import LabelValue from './LabelValue';
import { isVahvastiYksiloity } from '../../StaticUtils';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    readOnly: boolean;
    updateModelFieldAction?: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Etunimet = (props: OwnProps) => {
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid);
    return (
        <LabelValue
            updateModelFieldAction={props.updateModelFieldAction}
            readOnly={props.readOnly}
            values={{
                label: 'HENKILO_ETUNIMET',
                value: henkilo?.etunimet,
                inputValue: 'etunimet',
                disabled: isVahvastiYksiloity(henkilo),
            }}
        />
    );
};

export default Etunimet;
