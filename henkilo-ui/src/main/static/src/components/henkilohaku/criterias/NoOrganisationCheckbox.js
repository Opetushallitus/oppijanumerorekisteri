import React from 'react'

const NoOrganisationCheckbox = ({L, noOrganisationValue, noOrganisationAction}) =>
    <label className="oph-checkable" htmlFor="noOrganisaatioCriteria">
        <input id="noOrganisaatioCriteria" type="checkbox" className="oph-checkable-input"
               onChange={noOrganisationAction} checked={noOrganisationValue} />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_ILMANORGANISAATIOTA']}</span>
    </label>;

NoOrganisationCheckbox.propTypes = {
    L: React.PropTypes.object.isRequired,
    noOrganisationValue: React.PropTypes.bool.isRequired,
    noOrganisationAction: React.PropTypes.func.isRequired,
};

export default NoOrganisationCheckbox;
