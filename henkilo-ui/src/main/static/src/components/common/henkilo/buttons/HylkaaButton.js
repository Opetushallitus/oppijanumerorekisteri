import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";

const HylkaaButton = ({L, hylkaaAction, henkilo}) =>
    <ConfirmButton action={hylkaaAction}
                   cancel
                   confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_CONFIRM']}
                   normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA']}
                   key="hylkaa"
                   id="hylkaa" />;
HylkaaButton.propTypes = {
    L: React.PropTypes.object,
    hylkaaAction: React.PropTypes.func,
    henkilo: React.PropTypes.object,
};

export default HylkaaButton;
