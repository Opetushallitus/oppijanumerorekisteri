import React from 'react'
import Button from "../../button/Button"

const EditButtons = ({discardAction, updateAction, L}) =>
    <div>
        <Button key="discard" big cancel action={discardAction}>{L['PERUUTA_LINKKI']}</Button>
        <Button key="update" big action={updateAction}>{L['TALLENNA_LINKKI']}</Button>
    </div>;

EditButtons.propTypes = {
    discardAction: React.PropTypes.func,
    updateAction: React.PropTypes.func,
    L: React.PropTypes.object,
};

export default EditButtons;
