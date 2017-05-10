import React from 'react'
import AbstractViewContainer from "../../../../containers/henkilo/AbstractViewContainer";
import ConfirmButton from "../../button/ConfirmButton";

const MyonnaButton = ({L, myonnaAction, henkilo}) => <ConfirmButton action={myonnaAction}
                                            confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM']}
                                            normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA']}
                                            key="myonna"
                                            errorMessage={AbstractViewContainer.createPopupErrorMessage('myonna', henkilo, L)} />;

MyonnaButton.propTypes = {
    L: React.PropTypes.object,
    myonnaAction: React.PropTypes.func,
    henkilo: React.PropTypes.object,
};

export default MyonnaButton;
