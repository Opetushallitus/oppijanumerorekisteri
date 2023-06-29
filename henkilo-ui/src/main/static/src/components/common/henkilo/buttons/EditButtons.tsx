import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import Button from '../../button/Button';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    discardAction: () => any;
    updateAction: () => any;
    isValidForm: boolean;
};

type StateProps = {
    L: Localisations;
};
type Props = OwnProps & StateProps;

const EditButtons = (props: Props) => (
    <div>
        <Button className="edit-button-discard-button" key="discard" cancel action={props.discardAction}>
            {props.L['PERUUTA_LINKKI']}
        </Button>
        <Button
            className="edit-button-update-button"
            key="update"
            disabled={!props.isValidForm}
            action={props.updateAction}
        >
            {props.L['TALLENNA_LINKKI']}
        </Button>
    </div>
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(EditButtons);
