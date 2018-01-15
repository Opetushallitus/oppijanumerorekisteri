// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../../button/Button';

const EditButtons = ({discardAction, updateAction, L, isValidForm}) =>
    <div>
        <Button className="edit-button-discard-button" key="discard" cancel action={discardAction}>{L['PERUUTA_LINKKI']}</Button>
        <Button className="edit-button-update-button" key="update" disabled={!isValidForm} action={updateAction}>{L['TALLENNA_LINKKI']}</Button>
    </div>;

EditButtons.propTypes = {
    discardAction: PropTypes.func,
    updateAction: PropTypes.func,
    L: PropTypes.object,
    isValidForm: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(EditButtons);
