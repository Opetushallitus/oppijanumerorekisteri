// @flow
import './AbstractUserContent.css';
import React from 'react';
import EditButtons from "../buttons/EditButtons";
import Columns from 'react-columns';

type Props = {
    basicInfo: Array<{}>,
    readOnlyButtons: Array<{}>,
    readOnly: boolean,
    discardAction: () => void,
    updateAction: () => void,
}

const AbstractUserContent = ({basicInfo, readOnlyButtons, readOnly, discardAction, updateAction}: Props) => <div className="user-content">
    {/* By default rootStyles is { overflowX: 'hidden' }. This causes scroll bars to appear when inner content expands. */}
    <Columns columns={3} gap="10px" rootStyles={{}}>
        {
            basicInfo
                .map((info, idx) =>
                    <div key={idx} className="henkiloViewContent">
                        {
                            info.map((values, idx2) => <div key={idx2}>{values}</div>)
                        }
                    </div>
                )
        }
    </Columns>
    {readOnly
        ? <div className="henkiloViewButtons">
            {readOnlyButtons.map((button, idx) => <div style={{display: 'inline-block'}} key={idx}>{button}</div>)}
        </div>
        : <div className="henkiloViewEditButtons">
            <EditButtons discardAction={discardAction}
                         updateAction={updateAction}
            />
        </div>
    }
</div>;

export default AbstractUserContent;
