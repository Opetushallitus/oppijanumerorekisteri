import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";

const MyonnaButton = ({L, myonnaAction}) =>
    <ConfirmButton action={myonnaAction}
                   normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA']}
                   confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM']}
                   key="myonna"
                   id="myonna" />;

MyonnaButton.propTypes = {
    L: React.PropTypes.object,
    myonnaAction: React.PropTypes.func,
};

export default MyonnaButton;
