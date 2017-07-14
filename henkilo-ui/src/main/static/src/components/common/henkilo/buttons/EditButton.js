import React from 'react'
import PropTypes from 'prop-types'
import Button from "../../button/Button";

const EditButton = ({editAction, L}) => <Button key="edit" action={editAction}>{L['MUOKKAA_LINKKI']}</Button>;

EditButton.propTypes = {
    editAction: PropTypes.func,
    L: PropTypes.object,
};

export default EditButton;
