import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";

const MyonnaButton = ({L, myonnaAction, disabled}) =>
    <ConfirmButton action={myonnaAction}
                   normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA']}
                   confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM']}
                   key="myonna"
                   id="myonna"
                   disabled={disabled} />;

MyonnaButton.propTypes = {
    L: React.PropTypes.object.isRequired,
    myonnaAction: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool,
};

export default MyonnaButton;
