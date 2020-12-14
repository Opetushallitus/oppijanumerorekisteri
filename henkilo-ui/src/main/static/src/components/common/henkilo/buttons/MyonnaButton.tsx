import React from "react"
import PropTypes from "prop-types"
import ConfirmButton from "../../button/ConfirmButton"

const MyonnaButton = ({L, myonnaAction, disabled}) => (
    <ConfirmButton
        action={myonnaAction}
        normalLabel={L["HENKILO_KAYTTOOIKEUSANOMUS_MYONNA"]}
        confirmLabel={L["HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM"]}
        key="myonna"
        id="myonna"
        disabled={disabled}
    />
)

MyonnaButton.propTypes = {
    L: PropTypes.object.isRequired,
    myonnaAction: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default MyonnaButton