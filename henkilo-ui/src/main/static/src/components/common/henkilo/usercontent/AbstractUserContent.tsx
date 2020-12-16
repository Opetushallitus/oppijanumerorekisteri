import './AbstractUserContent.css';
import React from 'react';
import EditButtons from '../buttons/EditButtons';
import Columns from 'react-columns';

type Props = {
    basicInfo: Array<any>;
    readOnlyButtons: Array<any>;
    readOnly: boolean;
    discardAction: () => void;
    updateAction: () => void;
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
        {/* By default rootStyles is { overflowX: 'hidden' }. This causes scroll bars to appear when inner content expands. */}
        <Columns columns={3} gap="10px" rootStyles={{}}>
            {basicInfo.map((info, idx) => (
                <div key={idx} className="henkiloViewContent">
                    {info.map((values, idx2) => (
                        <div key={idx2}>{values}</div>
                    ))}
                </div>
            ))}
        </Columns>
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
