import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import Button from '../../button/Button';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    editAction: () => any;
    disabled?: boolean;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const EditButton = (props: Props) => (
    <Button key="edit" disabled={props.disabled} action={props.editAction}>
        {props.L['MUOKKAA_LINKKI']}
    </Button>
);
const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(EditButton);
