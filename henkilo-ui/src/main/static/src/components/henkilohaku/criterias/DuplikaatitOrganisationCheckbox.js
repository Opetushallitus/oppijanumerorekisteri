import React from 'react'

const DuplikaatitOrganisationCheckbox = ({L, duplikaatitValue, duplikaatitAction}) =>
    <label className="oph-checkable" htmlFor="duplikaatitCriteria">
        <input id="duplikaatitCriteria" type="checkbox" className="oph-checkable-input"
               onChange={duplikaatitAction} checked={duplikaatitValue} />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_DUPLIKAATIT']}</span>
    </label>;

DuplikaatitOrganisationCheckbox.propTypes = {
    L: React.PropTypes.object.isRequired,
    duplikaatitValue: React.PropTypes.bool.isRequired,
    duplikaatitAction: React.PropTypes.func.isRequired,
};

export default DuplikaatitOrganisationCheckbox;
