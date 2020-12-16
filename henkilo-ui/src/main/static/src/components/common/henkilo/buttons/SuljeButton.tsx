import React from 'react';
import PropTypes from 'prop-types';
import ConfirmButton from '../../button/ConfirmButton';

const SuljeButton = ({ L, suljeAction, disabled }) => (
    <ConfirmButton
        action={suljeAction}
        cancel
        normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE']}
        confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE_CONFIRM']}
        key="sulje"
        id="sulje"
        disabled={disabled}
    />
);

SuljeButton.propTypes = {
    L: PropTypes.object,
    suljeAction: PropTypes.func,
    disabled: PropTypes.bool,
};

export default SuljeButton;
