import React from "react"
import PropTypes from "prop-types"
import ConfirmButton from "../../button/ConfirmButton"

const HylkaaButton = ({L, hylkaaAction, henkilo, disabled}) => (
    <ConfirmButton
        action={hylkaaAction}
        cancel
        confirmLabel={L["HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_CONFIRM"]}
        normalLabel={L["HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA"]}
        key="hylkaa"
        id="hylkaa"
        disabled={disabled}
    />
)

HylkaaButton.propTypes = {
    L: PropTypes.object,
    hylkaaAction: PropTypes.func,
    henkilo: PropTypes.object,
}

export default HylkaaButton