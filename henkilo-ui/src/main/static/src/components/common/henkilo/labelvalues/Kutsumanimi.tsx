import React from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';

import LabelValue from './LabelValue';
import { useGetHenkiloQuery } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid?: string;
    isError?: boolean;
    readOnly: boolean;
    updateModelFieldAction: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
    defaultValue?: string;
};

const Kutsumanimi = (props: OwnProps) => {
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid ?? skipToken);
    return (
        <LabelValue
            readOnly={props.readOnly}
            updateModelFieldAction={props.updateModelFieldAction}
            values={{
                label: 'HENKILO_KUTSUMANIMI',
                value: props.defaultValue || henkilo?.kutsumanimi,
                inputValue: 'kutsumanimi',
                isError: props.isError,
            }}
        />
    );
};

export default Kutsumanimi;
