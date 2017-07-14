import React from 'react'
import PropTypes from 'prop-types'

const SubOrganisationCheckbox = ({L, subOrganisationValue, subOrganisationAction}) =>
    <label className="oph-checkable" htmlFor="subOrganisaatioCriteria">
        <input id="subOrganisaatioCriteria" type="checkbox" className="oph-checkable-input"
               onChange={subOrganisationAction} checked={subOrganisationValue} />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA']}</span>
    </label>;

SubOrganisationCheckbox.propTypes = {
    L: PropTypes.object.isRequired,
    subOrganisationValue: PropTypes.bool.isRequired,
    subOrganisationAction: PropTypes.func.isRequired,
};

export default SubOrganisationCheckbox;
