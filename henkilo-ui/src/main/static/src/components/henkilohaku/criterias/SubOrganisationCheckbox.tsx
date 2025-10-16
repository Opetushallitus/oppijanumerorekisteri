import React from 'react';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    subOrganisationValue: boolean;
    subOrganisationAction: (arg?: React.ChangeEvent<HTMLInputElement>) => void;
};

const SubOrganisationCheckbox = ({ L, subOrganisationValue, subOrganisationAction }: Props) => (
    <label className="oph-checkable" htmlFor="subOrganisaatioCriteria">
        <input
            id="subOrganisaatioCriteria"
            type="checkbox"
            className="oph-checkable-input"
            onChange={subOrganisationAction}
            checked={subOrganisationValue}
        />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA']}</span>
    </label>
);

export default SubOrganisationCheckbox;
