// @flow
import React from 'react'
import Button from "../../button/Button";

type Props = {
    editAction: () => any,
    L: any,
    disabled?: boolean
}

const EditButton = (props: Props) => <Button key="edit"
                                             disabled={props.disabled}
                                             action={props.editAction}>{props.L['MUOKKAA_LINKKI']}</Button>;

export default EditButton;
