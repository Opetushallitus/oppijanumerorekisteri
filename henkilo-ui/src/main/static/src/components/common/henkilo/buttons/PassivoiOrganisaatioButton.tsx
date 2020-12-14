import React from "react"
import PropTypes from "prop-types"
import ConfirmButton from "../../button/ConfirmButton"
import Button from "../../button/Button"

const PassivoiOrganisaatioButton = ({
    passive,
    id,
    L,
    passivoiOrgAction,
    disabled,
}) =>
    !passive ? (
        <ConfirmButton
            key="passivoiOrg"
            cancel
            action={() => passivoiOrgAction(id)}
            confirmLabel={L["HENKILO_ORG_PASSIVOI_CONFIRM"]}
            normalLabel={L["HENKILO_ORG_PASSIVOI"]}
            id={id}
            disabled={disabled}
        />
    ) : (
        <Button disabled action={() => {}}>
            {L["HENKILO_ORG_PASSIVOITU"]}
        </Button>
    )

PassivoiOrganisaatioButton.propTypes = {
    passive: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    L: PropTypes.object.isRequired,
    passivoiOrgAction: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default PassivoiOrganisaatioButton