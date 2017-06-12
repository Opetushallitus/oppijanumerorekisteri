import React from 'react';
import Columns from 'react-columns';

const LabelValueGroup = ({label, L, valueGroup}) => <div id={label}>
            <Columns columns={2} className="labelValue" rootStyles={{marginRight: '25%'}}>
                <span className="oph-bold">{L[label]}</span>
                {valueGroup}
            </Columns>
        </div>;
export default LabelValueGroup;

