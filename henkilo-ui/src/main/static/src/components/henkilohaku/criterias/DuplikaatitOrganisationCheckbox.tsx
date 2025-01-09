import React from 'react';
import PropTypes from 'prop-types';

const DuplikaatitOrganisationCheckbox = ({ L, duplikaatitValue, duplikaatitAction }) => (
    <label className="oph-checkable" htmlFor="duplikaatitCriteria">
        <input
            id="duplikaatitCriteria"
            type="checkbox"
            className="oph-checkable-input"
            onChange={duplikaatitAction}
            checked={duplikaatitValue}
        />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_DUPLIKAATIT']}</span>
    </label>
);

DuplikaatitOrganisationCheckbox.propTypes = {
    L: PropTypes.object.isRequired,
    duplikaatitValue: PropTypes.bool.isRequired,
    duplikaatitAction: PropTypes.func.isRequired,
};

export default DuplikaatitOrganisationCheckbox;
