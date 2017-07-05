import React from 'react'

const SubOrganisationCheckbox = ({L, subOrganisationValue, subOrganisationAction}) =>
    <label className="oph-checkable" htmlFor="subOrganisaatioCriteria">
        <input id="subOrganisaatioCriteria" type="checkbox" className="oph-checkable-input"
               onChange={subOrganisationAction} checked={subOrganisationValue} />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA']}</span>
    </label>;

SubOrganisationCheckbox.propTypes = {
    L: React.PropTypes.object.isRequired,
    subOrganisationValue: React.PropTypes.bool.isRequired,
    subOrganisationAction: React.PropTypes.func.isRequired,
};

export default SubOrganisationCheckbox;
