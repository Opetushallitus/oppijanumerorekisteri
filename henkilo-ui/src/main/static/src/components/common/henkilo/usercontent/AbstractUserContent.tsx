import './AbstractUserContent.css';
import React, { ReactNode } from 'react';
import EditButtons from '../buttons/EditButtons';

type Props = {
    basicInfo: ReactNode[][];
    readOnlyButtons: ReactNode[];
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => Promise<void>;
    isValidForm: boolean;
};

const AbstractUserContent = ({
    basicInfo,
    readOnlyButtons,
    readOnly,
    discardAction,
    updateAction,
    isValidForm,
}: Props) => (
    <div className="user-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {basicInfo.map((info, idx) => (
                <div key={idx} className="henkiloViewContent">
                    {info.map((values, idx2) => (
                        <div key={idx2}>{values}</div>
                    ))}
                </div>
            ))}
        </div>
        {readOnly ? (
            <div className="henkiloViewButtons">
                {readOnlyButtons.map((button, idx) => (
                    <div style={{ display: 'inline-block' }} key={idx}>
                        {button}
                    </div>
                ))}
            </div>
        ) : (
            <div className="henkiloViewEditButtons">
                <EditButtons discardAction={discardAction} updateAction={updateAction} isValidForm={isValidForm} />
            </div>
        )}
    </div>
);

export default AbstractUserContent;
