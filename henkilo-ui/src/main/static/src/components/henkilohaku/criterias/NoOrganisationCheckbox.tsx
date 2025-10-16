import React from 'react';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    noOrganisationValue: boolean;
    noOrganisationAction: () => void;
};

const NoOrganisationCheckbox = ({ L, noOrganisationValue, noOrganisationAction }: Props) => (
    <label className="oph-checkable" htmlFor="noOrganisaatioCriteria">
        <input
            id="noOrganisaatioCriteria"
            type="checkbox"
            className="oph-checkable-input"
            onChange={noOrganisationAction}
            checked={noOrganisationValue}
        />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_ILMANORGANISAATIOTA']}</span>
    </label>
);

export default NoOrganisationCheckbox;
