import React from 'react'
import Button from "../../button/Button"

const EditButtons = ({discardAction, updateAction, L}) =>
    <div>
        <Button className="edit-button-discard-button" key="discard" cancel action={discardAction}>{L['PERUUTA_LINKKI']}</Button>
        <Button className="edit-button-update-button" key="update" action={updateAction}>{L['TALLENNA_LINKKI']}</Button>
    </div>;

EditButtons.propTypes = {
    discardAction: React.PropTypes.func,
    updateAction: React.PropTypes.func,
    L: React.PropTypes.object,
};

export default EditButtons;
