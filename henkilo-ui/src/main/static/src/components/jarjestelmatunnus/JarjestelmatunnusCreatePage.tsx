import React, { FormEvent, useState } from 'react';
import { RouteActions } from 'react-router-redux';

import { useLocalisations } from '../../selectors';
import { usePostPalvelukayttajaMutation } from '../../api/kayttooikeus';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsInput } from '../design-system/OphDsInput';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';

type Props = {
    router: RouteActions;
};

export const JarjestelmatunnusCreatePage = ({ router }: Props) => {
    const { L } = useLocalisations();
    const [nimi, setNimi] = useState('');
    const [postPalvelukayttaja, { isLoading }] = usePostPalvelukayttajaMutation();
    const dispatch = useAppDispatch();

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await postPalvelukayttaja({ nimi })
            .unwrap()
            .then((data) => {
                router.push(`/virkailija/${data.oid}`);
            })
            .catch((error) => {
                dispatch(
                    add({
                        header: L['HENKILON_LUONTI_EPAONNISTUI'],
                        id: 'jarjestelmatunnusluonti-' + Math.random(),
                        type: 'error',
                    })
                );
                throw error;
            });
    };

    return (
        <OphDsPage header={L['JARJESTELMATUNNUSTEN_LUONTI']}>
            <form onSubmit={onSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <OphDsInput id="palvelu" label={L['HENKILO_PALVELUN_NIMI']} onChange={setNimi} />
                    <div>
                        <button type="submit" className="oph-ds-button" disabled={!nimi || isLoading}>
                            {L['TALLENNA_LINKKI']}
                        </button>
                    </div>
                </div>
            </form>
        </OphDsPage>
    );
};
