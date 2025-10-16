import React from 'react';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    passiivisetValue: boolean;
    passiivisetAction: () => void;
};

const PassiivisetOrganisationCheckbox = ({ L, passiivisetValue, passiivisetAction }: Props) => (
    <label className="oph-checkable" htmlFor="passiivisetCriteria">
        <input
            id="passiivisetCriteria"
            type="checkbox"
            className="oph-checkable-input"
            onChange={passiivisetAction}
            checked={passiivisetValue}
        />
        <span className="oph-checkable-text"> {L['HENKILOHAKU_FILTERS_PASSIIVISET']}</span>
    </label>
);

export default PassiivisetOrganisationCheckbox;
