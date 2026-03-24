import React, { useState } from 'react';
import Select from 'react-select';

import { useLocalisations } from '../../selectors';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { selectStyles } from '../../utilities/select';
import { getLocalisedText } from '../common/StaticUtils';

type HaeJatkoaikaaProps = {
    anomus: MyonnettyKayttooikeusryhma;
    emails: string[];
    onCancel: () => void;
    onCreate: (email: string) => void;
};

export const HaeJatkoaikaa = ({ anomus, emails, onCancel, onCreate }: HaeJatkoaikaaProps) => {
    const { L, locale } = useLocalisations();
    const [email, setEmail] = useState<string>(emails[0] ?? '');
    const options = emails.map((e) => ({ label: e, value: e }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>{L('HAE_JATKOAIKAA_SELITE')}</p>
            <p>
                {L('HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA')}: {getLocalisedText(anomus.ryhmaNames, locale)}
            </p>
            <div>
                <label className="oph-ds-label" htmlFor="jatkoaikaEmail">
                    {L('OMATTIEDOT_SAHKOPOSTIOSOITE')}
                </label>
                <Select
                    {...selectStyles}
                    inputId="jatkoaikaEmail"
                    options={options}
                    value={options.find((o) => o.value === email)}
                    onChange={(o) => o && setEmail(o.value)}
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="oph-ds-button" onClick={() => onCreate(email)}>
                    {L('TALLENNA')}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => onCancel()}>
                    {L('PERUUTA')}
                </button>
            </div>
        </div>
    );
};
