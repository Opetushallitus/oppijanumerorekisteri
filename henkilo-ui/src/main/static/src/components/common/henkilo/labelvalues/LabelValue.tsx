import React from 'react';

import Field from '../../field/Field';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    values: {
        value?: string;
        label?: string;
        inputValue?: string;
        disabled?: boolean;
        password?: boolean;
        isError?: boolean;
        showOnlyOnWrite?: boolean;
        readOnly?: boolean;
        className?: string;
    };
    readOnly?: boolean;
    updateModelFieldAction?: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
    autofocus?: boolean;
    required?: boolean;
    hideLabel?: boolean;
};

const LabelValue = ({ values, readOnly, updateModelFieldAction, autofocus, required, hideLabel }: OwnProps) => {
    const { L } = useLocalisations();
    return !values.showOnlyOnWrite || !readOnly ? (
        <div id={values.label}>
            <div
                className="labelValue"
                style={{
                    display: 'grid',
                    gridTemplateColumns: readOnly ? '1fr 1fr' : '1fr',
                }}
            >
                {!hideLabel && values.label ? (
                    <span className="oph-bold">{L(values.label) + (required ? ' *' : '')}</span>
                ) : (
                    <span>&nbsp;</span>
                )}
                <Field
                    {...values}
                    autofocus={autofocus}
                    disabled={values.disabled}
                    changeAction={updateModelFieldAction}
                    readOnly={!!values.readOnly || !!readOnly}
                >
                    {values.value ?? ''}
                </Field>
            </div>
        </div>
    ) : null;
};

export default LabelValue;
