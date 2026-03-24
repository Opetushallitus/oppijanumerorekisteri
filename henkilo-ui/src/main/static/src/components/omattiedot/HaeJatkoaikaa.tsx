import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';

import { useLocalisations } from '../../selectors';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { selectStyles } from '../../utilities/select';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';
import { parseWorkEmails } from '../../utilities/henkilo.util';

type HaeJatkoaikaaProps = {
    anomus: MyonnettyKayttooikeusryhma;
    oid: string;
    onCancel: () => void;
    onCreate: (email: string) => void;
};

export const HaeJatkoaikaa = ({ anomus, oid, onCancel, onCreate }: HaeJatkoaikaaProps) => {
    const { L, locale } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(oid);
    const [emails, setEmails] = useState<string[]>([]);
    const [email, setEmail] = useState<string>();

    useEffect(() => {
        setEmails(parseWorkEmails(henkilo?.yhteystiedotRyhma));
    }, [henkilo]);

    const options = useMemo(() => {
        return emails.map((e) => ({ label: e, value: e }));
    }, [emails]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>{L('HAE_JATKOAIKAA_SELITE')}</p>
            <p>
                {L('HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA')}: {getTextGroupLocalisation(anomus.ryhmaNames, locale)}
            </p>
            <div>
                <label className="oph-ds-label" htmlFor="jatkoaikaEmail">
                    {L('OMATTIEDOT_SAHKOPOSTIOSOITE')}
                </label>
                <Select
                    {...selectStyles}
                    inputId="jatkoaikaEmail"
                    placeholder={L('OMATTIEDOT_VAATIMUS_EMAIL')}
                    options={options}
                    value={options.find((o) => o.value === email)}
                    onChange={(o) => o && setEmail(o.value)}
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="oph-ds-button" onClick={() => email && onCreate(email)} disabled={!email}>
                    {L('TALLENNA')}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => onCancel()}>
                    {L('PERUUTA')}
                </button>
            </div>
        </div>
    );
};
