import React, { SyntheticEvent } from 'react';

import LabelValue from './LabelValue';
import { isVahvastiYksiloity } from '../../StaticUtils';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    readOnly: boolean;
    updateModelFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const EidasTunnisteet = (props: OwnProps) => {
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid);
    const tunnisteet = (henkilo?.eidasTunnisteet ?? []).map((_) => _.tunniste);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                className: 'eidasTruncated',
                label: 'HENKILO_EIDASTUNNISTEET',
                value: tunnisteet.length > 0 ? tunnisteet.join(', ') : '-',
                inputValue: 'eidasTunnisteet',
                disabled: isVahvastiYksiloity(henkilo),
            }}
        />
    );
};

export default EidasTunnisteet;
