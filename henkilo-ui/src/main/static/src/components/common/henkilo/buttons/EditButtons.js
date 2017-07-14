import React from 'react'
import PropTypes from 'prop-types'
import Button from "../../button/Button"

const EditButtons = ({discardAction, updateAction, L}) =>
    <div>
        <Button className="edit-button-discard-button" key="discard" cancel action={discardAction}>{L['PERUUTA_LINKKI']}</Button>
        <Button className="edit-button-update-button" key="update" action={updateAction}>{L['TALLENNA_LINKKI']}</Button>
    </div>;

EditButtons.propTypes = {
    discardAction: PropTypes.func,
    updateAction: PropTypes.func,
    L: PropTypes.object,
};

export default EditButtons;
