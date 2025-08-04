import React, { FormEvent, useState } from 'react';
import { RouteActions } from 'react-router-redux';

import WideRedNotification from '../common/notifications/WideRedNotification';
import { useLocalisations } from '../../selectors';
import { usePostPalvelukayttajaMutation } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';

type Props = {
    router: RouteActions;
};

export const PalvelukayttajaCreatePage = ({ router }: Props) => {
    const { L } = useLocalisations();
    useTitle(L['TITLE_PALVELUKAYTTAJIEN_LUONTI']);
    const [error, setError] = useState('');
    const [nimi, setNimi] = useState('');
    const [postPalvelukayttaja] = usePostPalvelukayttajaMutation();

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await postPalvelukayttaja({ nimi })
            .unwrap()
            .then((data) => {
                router.push(`/virkailija/${data.oid}`);
            })
            .catch(() => {
                setError(L['HENKILON_LUONTI_EPAONNISTUI']);
                throw error;
            });
    };

    return (
        <div className="mainContent wrapper">
            {error && <WideRedNotification message={error} closeAction={() => setError('')} />}
            <span className="oph-h2 oph-bold">{L['PALVELUKAYTTAJAN_LUONTI_OTSIKKO']}</span>
            <form onSubmit={onSubmit}>
                <div className="oph-field oph-field-is-required">
                    <label htmlFor="nimi" className="oph-label">
                        {L['HENKILO_PALVELUN_NIMI']}
                    </label>
                    <input
                        id="nimi"
                        className="oph-input"
                        placeholder={L['HENKILO_PALVELUN_NIMI']}
                        type="text"
                        name="nimi"
                        value={nimi}
                        onChange={(e) => setNimi(e.target.value)}
                    />
                </div>
                <div className="oph-field">
                    <button type="submit" className="oph-button oph-button-primary" disabled={!nimi}>
                        {L['TALLENNA_LINKKI']}
                    </button>
                </div>
            </form>
        </div>
    );
};
