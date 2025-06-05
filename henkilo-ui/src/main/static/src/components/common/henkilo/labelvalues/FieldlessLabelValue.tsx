import React, { ReactNode } from 'react';
import Columns from 'react-columns';

import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    label?: string;
    showOnlyOnWrite?: boolean;
    readOnly?: boolean;
    required?: boolean;
    hideLabel?: boolean;
    children: ReactNode;
};

export const FieldlessLabelValue = ({ showOnlyOnWrite, label, readOnly, children, required, hideLabel }: OwnProps) => {
    const { L } = useLocalisations();

    return !showOnlyOnWrite || !readOnly ? (
        <div id={label}>
            <Columns
                columns={readOnly ? 2 : 1}
                className="labelValue"
                rootStyles={{ marginRight: '25%', marginBottom: '2%' }}
            >
                {!hideLabel && label ? (
                    <span style={{ marginRight: 40 }} className="oph-bold">
                        {L[label] + (required ? ' *' : '')}
                    </span>
                ) : (
                    <span>&nbsp;</span>
                )}
                {children}
            </Columns>
        </div>
    ) : null;
};
