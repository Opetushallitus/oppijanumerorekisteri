import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";

const SuljeButton = ({L, suljeAction}) =>
    <ConfirmButton action={suljeAction}
                   normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE']}
                   confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_SULJE_CONFIRM']}
                   key="sulje"
                   id="sulje" />;

SuljeButton.propTypes = {
    L: React.PropTypes.object,
    suljeAction: React.PropTypes.func,
};

export default SuljeButton;
