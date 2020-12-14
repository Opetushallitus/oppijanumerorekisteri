import React from "react"
import PropTypes from "prop-types"

const PassiivisetOrganisationCheckbox = ({
    L,
    passiivisetValue,
    passiivisetAction,
}) => (
    <label className="oph-checkable" htmlFor="passiivisetCriteria">
        <input
            id="passiivisetCriteria"
            type="checkbox"
            className="oph-checkable-input"
            onChange={passiivisetAction}
            checked={passiivisetValue}
        />
        <span className="oph-checkable-text">
            {" "}
            {L["HENKILOHAKU_FILTERS_PASSIIVISET"]}
        </span>
    </label>
)

PassiivisetOrganisationCheckbox.propTypes = {
    L: PropTypes.object.isRequired,
    passiivisetValue: PropTypes.bool.isRequired,
    passiivisetAction: PropTypes.func.isRequired,
}

export default PassiivisetOrganisationCheckbox