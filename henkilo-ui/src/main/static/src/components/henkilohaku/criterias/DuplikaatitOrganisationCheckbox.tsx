import React from 'react';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    duplikaatitValue: boolean;
    duplikaatitAction: () => void;
};

const DuplikaatitOrganisationCheckbox = ({ L, duplikaatitValue, duplikaatitAction }: Props) => (
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

export default DuplikaatitOrganisationCheckbox;
