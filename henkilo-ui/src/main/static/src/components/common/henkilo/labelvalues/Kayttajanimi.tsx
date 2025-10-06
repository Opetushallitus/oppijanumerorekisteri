import React from 'react';

import LabelValue from './LabelValue';
import { KayttajatiedotRead } from '../../../../types/domain/kayttooikeus/KayttajatiedotRead';

type OwnProps = {
    kayttajatiedot?: KayttajatiedotRead;
    readOnly?: boolean;
    updateModelFieldAction: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
    disabled: boolean;
    isError?: boolean;
    defaultValue?: string;
};

const Kayttajanimi = (props: OwnProps) => {
    return (
        <LabelValue
            updateModelFieldAction={props.updateModelFieldAction}
            readOnly={props.readOnly}
            values={{
                label: 'HENKILO_KAYTTAJANIMI',
                value: props.defaultValue || props.kayttajatiedot?.username,
                inputValue: 'kayttajanimi',
                disabled: props.disabled,
                isError: props.isError,
            }}
        />
    );
};

export default Kayttajanimi;
