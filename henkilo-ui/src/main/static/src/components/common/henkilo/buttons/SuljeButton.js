import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";

const SuljeButton = ({L, suljeAction, disabled}) =>
    <ConfirmButton action={suljeAction}
                   cancel
                   normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE']}
                   confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE_CONFIRM']}
                   key="sulje"
                   id="sulje"
                   disabled={disabled} />;

SuljeButton.propTypes = {
    L: React.PropTypes.object,
    suljeAction: React.PropTypes.func,
    disabled: React.PropTypes.bool,
};

export default SuljeButton;
