import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLocalisations } from '../../selectors';
import { usePostPalvelukayttajaMutation } from '../../api/kayttooikeus';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsInput } from '../design-system/OphDsInput';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { jarjestelmatunnusNavigation } from '../navigation/navigationconfigurations';

export const JarjestelmatunnusCreatePage = () => {
    const { L } = useLocalisations();
    useTitle(L('JARJESTELMATUNNUSTEN_LUONTI'));
    useNavigation(jarjestelmatunnusNavigation(), false);
    const [nimi, setNimi] = useState('');
    const [postPalvelukayttaja, { isLoading }] = usePostPalvelukayttajaMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await postPalvelukayttaja({ nimi })
            .unwrap()
            .then((data) => {
                navigate(`/jarjestelmatunnus/${data.oid}`);
            })
            .catch((error) => {
                dispatch(
                    add({
                        header: L('HENKILON_LUONTI_EPAONNISTUI'),
                        id: 'jarjestelmatunnusluonti-' + Math.random(),
                        type: 'error',
                    })
                );
                throw error;
            });
    };

    return (
        <OphDsPage header={L('JARJESTELMATUNNUSTEN_LUONTI')}>
            <form onSubmit={onSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <OphDsInput id="palvelu" label={L('HENKILO_PALVELUN_NIMI')} onChange={setNimi} />
                    <div>
                        <button type="submit" className="oph-ds-button" disabled={!nimi || isLoading}>
                            {L('TALLENNA_LINKKI')}
                        </button>
                    </div>
                </div>
            </form>
        </OphDsPage>
    );
};
