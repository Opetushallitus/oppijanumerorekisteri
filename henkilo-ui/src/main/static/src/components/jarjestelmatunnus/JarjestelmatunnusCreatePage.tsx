import React, { FormEvent, useState } from 'react';
import { RouteActions } from 'react-router-redux';

import WideRedNotification from '../common/notifications/WideRedNotification';
import { useLocalisations } from '../../selectors';
import { usePostPalvelukayttajaMutation } from '../../api/kayttooikeus';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsInput } from '../design-system/OphDsInput';

type Props = {
    router: RouteActions;
};

export const JarjestelmatunnusCreatePage = ({ router }: Props) => {
    const { L } = useLocalisations();
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
        <OphDsPage header={L['JARJESTELMATUNNUSTEN_LUONTI']}>
            {error && <WideRedNotification message={error} closeAction={() => setError('')} />}
            <form onSubmit={onSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <OphDsInput id="palvelu" label={L['HENKILO_PALVELUN_NIMI']} onChange={setNimi} />
                    <div>
                        <button type="submit" className="oph-ds-button" disabled={!nimi}>
                            {L['TALLENNA_LINKKI']}
                        </button>
                    </div>
                </div>
            </form>
        </OphDsPage>
    );
};
