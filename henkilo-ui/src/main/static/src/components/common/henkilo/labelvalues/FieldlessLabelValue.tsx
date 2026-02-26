import React, { ReactNode } from 'react';

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
            <div
                className="labelValue"
                style={{
                    display: 'grid',
                    gridTemplateColumns: readOnly ? '1fr 1fr' : '1fr',
                }}
            >
                {!hideLabel && label ? (
                    <span className="oph-bold">{L(label) + (required ? ' *' : '')}</span>
                ) : (
                    <span>&nbsp;</span>
                )}
                {children}
            </div>
        </div>
    ) : null;
};
