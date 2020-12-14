import React from "react"
import PropTypes from "prop-types"

const NoOrganisationCheckbox = ({
    L,
    noOrganisationValue,
    noOrganisationAction,
}) => (
    <label className="oph-checkable" htmlFor="noOrganisaatioCriteria">
        <input
            id="noOrganisaatioCriteria"
            type="checkbox"
            className="oph-checkable-input"
            onChange={noOrganisationAction}
            checked={noOrganisationValue}
        />
        <span className="oph-checkable-text">
            {" "}
            {L["HENKILOHAKU_FILTERS_ILMANORGANISAATIOTA"]}
        </span>
    </label>
)

NoOrganisationCheckbox.propTypes = {
    L: PropTypes.object.isRequired,
    noOrganisationValue: PropTypes.bool.isRequired,
    noOrganisationAction: PropTypes.func.isRequired,
}

export default NoOrganisationCheckbox