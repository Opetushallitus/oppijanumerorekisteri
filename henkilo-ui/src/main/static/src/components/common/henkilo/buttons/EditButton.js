// @flow
import React from 'react';
import {connect} from 'react-redux';
import Button from "../../button/Button";
import type {L} from "../../../../types/localisation.type";

type Props = {
    editAction: () => any,
    L: L,
    disabled?: boolean
}

const EditButton = (props: Props) => <Button key="edit"
                                             disabled={props.disabled}
                                             action={props.editAction}>{props.L['MUOKKAA_LINKKI']}</Button>;
const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(EditButton);
