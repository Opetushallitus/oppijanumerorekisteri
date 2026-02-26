import React from 'react';

import LabelValue from './LabelValue';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    disabled: boolean;
    isError: boolean;
    updateModelFieldAction: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
};

const Salasana = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <div>
            <LabelValue
                {...props}
                values={{
                    label: 'HENKILO_PASSWORD',
                    value: '',
                    inputValue: 'password',
                    disabled: props.disabled,
                    password: true,
                    isError: props.isError,
                }}
            />
            <LabelValue
                {...props}
                values={{
                    label: 'HENKILO_PASSWORDAGAIN',
                    value: '',
                    inputValue: 'passwordAgain',
                    disabled: props.disabled,
                    password: true,
                    isError: props.isError,
                }}
            />
            <LabelValue
                {...props}
                readOnly={true}
                required={false}
                hideLabel={true}
                values={{
                    label: 'EMPTY_PLACEHOLDER',
                    value: L('REKISTEROIDY_PASSWORD_TEXT'),
                    className: 'oph-h6',
                }}
            />
        </div>
    );
};

export default Salasana;
