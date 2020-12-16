import React from 'react';
import { connect } from 'react-redux';
import Button from '../../button/Button';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    discardAction: () => any;
    updateAction: () => any;
    isValidForm: boolean;
};

type Props = OwnProps & {
    L: Localisations;
};

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

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<Props, OwnProps>(mapStateToProps, {})(EditButtons);
