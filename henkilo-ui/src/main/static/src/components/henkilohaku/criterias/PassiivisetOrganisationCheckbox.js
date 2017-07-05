import React from 'react'

const PassiivisetOrganisationCheckbox = ({L, passiivisetValue, passiivisetAction}) =>
    <label className="oph-checkable" htmlFor="passiivisetCriteria">
        <input id="passiivisetCriteria" type="checkbox" className="oph-checkable-input"
               onChange={passiivisetAction} checked={passiivisetValue} />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_PASSIIVISET']}</span>
    </label>;

PassiivisetOrganisationCheckbox.propTypes = {
    L: React.PropTypes.object.isRequired,
    passiivisetValue: React.PropTypes.bool.isRequired,
    passiivisetAction: React.PropTypes.func.isRequired,
};

export default PassiivisetOrganisationCheckbox;
