import React from 'react';
import { connect } from 'react-redux';
import Button from '../../button/Button';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    editAction: () => any;
    disabled?: boolean;
};

type Props = OwnProps & {
    L: Localisations;
};

const EditButton = (props: Props) => (
    <Button key="edit" disabled={props.disabled} action={props.editAction}>
        {props.L['MUOKKAA_LINKKI']}
    </Button>
);
const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<Props, OwnProps>(mapStateToProps, {})(EditButton);
