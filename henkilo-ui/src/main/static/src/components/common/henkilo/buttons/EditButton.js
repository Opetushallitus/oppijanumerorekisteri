import React from 'react'
import Button from "../../button/Button";

const EditButton = ({editAction, L}) => <Button key="edit" big action={editAction}>{L['MUOKKAA_LINKKI']}</Button>;

export default EditButton;
