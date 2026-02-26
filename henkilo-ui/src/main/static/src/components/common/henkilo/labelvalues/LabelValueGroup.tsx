import React, { ReactNode } from 'react';

import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    label: string;
    valueGroup: ReactNode;
};

const LabelValueGroup = ({ label, valueGroup }: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <div id={label}>
            <div className="labelValue" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <span className="oph-bold">{L(label)}</span>
                {valueGroup}
            </div>
        </div>
    );
};

export default LabelValueGroup;
